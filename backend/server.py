from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import socketio
import aiofiles
from passlib.context import CryptContext
import jwt
from PIL import Image
import io
import math
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://rentwala.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[dict] = None
    gogo_points: int = 1000
    total_call_clicks: int = 0
    total_active_time: int = 0
    last_activity: Optional[datetime] = None
    created_at: datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Ad(BaseModel):
    model_config = ConfigDict(extra="ignore")
    ad_id: str
    user_id: str
    category: str
    subcategory: Optional[str] = None
    title: str
    description: str
    price_per_day: float
    images: List[str]
    location: dict
    contact_number: str
    status: str = "pending"
    views: int = 0
    created_at: datetime

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    message_id: str
    sender_id: str
    receiver_id: str
    ad_id: str
    message: str
    image: Optional[str] = None
    timestamp: datetime
    seen: bool = False

class SavedAd(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    ad_id: str
    saved_at: datetime

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    transaction_id: str
    from_user_id: str
    to_user_id: str
    amount: int
    transaction_type: str  # "transfer", "registration_bonus", "ad_post_deduction"
    description: str
    timestamp: datetime

class PointsTransfer(BaseModel):
    to_user_id: str
    amount: int
    ad_id: Optional[str] = None

async def get_current_user(request: Request) -> dict:
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if "created_at" in user_doc and isinstance(user_doc["created_at"], datetime):
        user_doc["created_at"] = user_doc["created_at"].isoformat()
    
    return user_doc

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_password = pwd_context.hash(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "password": hashed_password,
        "name": user_data.name,
        "picture": None,
        "phone": None,
        "location": None,
        "gogo_points": 1000,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(user_doc)
    
    # Record registration bonus transaction
    bonus_transaction = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "from_user_id": "system",
        "to_user_id": user_id,
        "amount": 1000,
        "transaction_type": "registration_bonus",
        "description": "Welcome bonus on registration",
        "timestamp": datetime.now(timezone.utc)
    }
    await db.transactions.insert_one(bonus_transaction)
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    user_doc.pop("password")
    user_doc.pop("_id")
    if "created_at" in user_doc and isinstance(user_doc["created_at"], datetime):
        user_doc["created_at"] = user_doc["created_at"].isoformat()
    
    response = JSONResponse({"user": user_doc, "session_token": session_token})
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    return response

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user_doc = await db.users.find_one({"email": login_data.email})
    if not user_doc or not pwd_context.verify(login_data.password, user_doc.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    user_doc.pop("password")
    user_doc.pop("_id")
    if "created_at" in user_doc and isinstance(user_doc["created_at"], datetime):
        user_doc["created_at"] = user_doc["created_at"].isoformat()
    
    response = JSONResponse({"user": user_doc, "session_token": session_token})
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    return response



@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out"}

@api_router.put("/user/profile")
async def update_profile(
    name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    picture: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    update_data = {}
    if name:
        update_data["name"] = name
    if phone:
        update_data["phone"] = phone
    if location:
        import json
        update_data["location"] = json.loads(location)
    
    if picture:
        file_ext = picture.filename.split(".")[-1]
        filename = f"{uuid.uuid4().hex}.{file_ext}"
        filepath = UPLOAD_DIR / filename
        
        image_data = await picture.read()
        img = Image.open(io.BytesIO(image_data))
        img.thumbnail((500, 500))
        img.save(filepath)
        
        update_data["picture"] = f"/api/uploads/{filename}"
    
    if update_data:
        await db.users.update_one(
            {"user_id": current_user["user_id"]},
            {"$set": update_data}
        )
    
    updated_user = await db.users.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if "created_at" in updated_user and isinstance(updated_user["created_at"], datetime):
        updated_user["created_at"] = updated_user["created_at"].isoformat()
    return updated_user

@api_router.post("/ads")
async def create_ad(
    category: str = Form(...),
    subcategory: Optional[str] = Form(None),
    title: str = Form(...),
    description: str = Form(...),
    price_per_day: float = Form(...),
    location: str = Form(...),
    contact_number: str = Form(...),
    images: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Check if user has enough points
    user_points = current_user.get("gogo_points", 0)
    if user_points < 1:
        raise HTTPException(status_code=400, detail="Not enough Gogo Points. You need at least 1 point to post an ad.")
    
    if len(images) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed")
    
    image_urls = []
    for img in images:
        file_ext = img.filename.split(".")[-1]
        filename = f"{uuid.uuid4().hex}.{file_ext}"
        filepath = UPLOAD_DIR / filename
        
        image_data = await img.read()
        image_obj = Image.open(io.BytesIO(image_data))
        image_obj.thumbnail((1200, 1200))
        image_obj.save(filepath)
        
        image_urls.append(f"/api/uploads/{filename}")
    
    import json
    location_data = json.loads(location)
    
    ad_id = f"ad_{uuid.uuid4().hex[:12]}"
    ad_doc = {
        "ad_id": ad_id,
        "user_id": current_user["user_id"],
        "category": category,
        "subcategory": subcategory,
        "title": title,
        "description": description,
        "price_per_day": price_per_day,
        "images": image_urls,
        "location": location_data,
        "contact_number": contact_number,
        "status": "active",
        "views": 0,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.ads.insert_one(ad_doc)
    ad_doc.pop("_id")
    
    # Deduct 1 Gogo Point for posting an ad
    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$inc": {"gogo_points": -1}}
    )
    
    # Record the transaction
    deduction_transaction = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "from_user_id": current_user["user_id"],
        "to_user_id": "system",
        "amount": 1,
        "transaction_type": "ad_post_deduction",
        "description": f"Ad post: {title}",
        "timestamp": datetime.now(timezone.utc)
    }
    await db.transactions.insert_one(deduction_transaction)
    
    return ad_doc

@api_router.get("/ads")
async def get_ads(
    category: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    max_distance: Optional[float] = 20,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None
):
    query = {"status": "active"}
    if category:
        query["category"] = category
    if min_price is not None or max_price is not None:
        query["price_per_day"] = {}
        if min_price is not None:
            query["price_per_day"]["$gte"] = min_price
        if max_price is not None:
            query["price_per_day"]["$lte"] = max_price
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    ads = await db.ads.find(query, {"_id": 0}).to_list(1000)
    
    if lat is not None and lng is not None:
        def calculate_distance(lat1, lon1, lat2, lon2):
            R = 6371
            dLat = math.radians(lat2 - lat1)
            dLon = math.radians(lon2 - lon1)
            a = math.sin(dLat/2) * math.sin(dLat/2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon/2) * math.sin(dLon/2)
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            return R * c
        
        ads_with_distance = []
        for ad in ads:
            if ad.get("location") and ad["location"].get("lat") and ad["location"].get("lng"):
                distance = calculate_distance(lat, lng, ad["location"]["lat"], ad["location"]["lng"])
                if distance <= max_distance:
                    ad["distance"] = round(distance, 2)
                    ads_with_distance.append(ad)
        ads = sorted(ads_with_distance, key=lambda x: x.get("distance", 999))
    
    for ad in ads:
        user = await db.users.find_one({"user_id": ad["user_id"]}, {"_id": 0, "name": 1, "picture": 1})
        ad["owner"] = user
    
    return ads

@api_router.get("/ads/{ad_id}")
async def get_ad(ad_id: str):
    ad = await db.ads.find_one({"ad_id": ad_id}, {"_id": 0})
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    
    await db.ads.update_one({"ad_id": ad_id}, {"$inc": {"views": 1}})
    ad["views"] += 1
    
    user = await db.users.find_one({"user_id": ad["user_id"]}, {"_id": 0})
    ad["owner"] = user
    
    return ad

@api_router.put("/ads/{ad_id}")
async def update_ad(
    ad_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price_per_day: Optional[float] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    ad = await db.ads.find_one({"ad_id": ad_id})
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    if ad["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {}
    if title:
        update_data["title"] = title
    if description:
        update_data["description"] = description
    if price_per_day is not None:
        update_data["price_per_day"] = price_per_day
    
    if update_data:
        await db.ads.update_one({"ad_id": ad_id}, {"$set": update_data})
    
    updated_ad = await db.ads.find_one({"ad_id": ad_id}, {"_id": 0})
    return updated_ad

@api_router.delete("/ads/{ad_id}")
async def delete_ad(ad_id: str, current_user: dict = Depends(get_current_user)):
    ad = await db.ads.find_one({"ad_id": ad_id})
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    if ad["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.ads.delete_one({"ad_id": ad_id})
    return {"message": "Ad deleted"}

@api_router.get("/user/ads")
async def get_user_ads(current_user: dict = Depends(get_current_user)):
    ads = await db.ads.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(1000)
    return ads

@api_router.post("/ads/{ad_id}/save")
async def save_ad(ad_id: str, current_user: dict = Depends(get_current_user)):
    existing = await db.saved_ads.find_one({"user_id": current_user["user_id"], "ad_id": ad_id})
    if existing:
        return {"message": "Already saved"}
    
    saved_doc = {
        "user_id": current_user["user_id"],
        "ad_id": ad_id,
        "saved_at": datetime.now(timezone.utc)
    }
    await db.saved_ads.insert_one(saved_doc)
    return {"message": "Ad saved"}

@api_router.delete("/ads/{ad_id}/save")
async def unsave_ad(ad_id: str, current_user: dict = Depends(get_current_user)):
    await db.saved_ads.delete_one({"user_id": current_user["user_id"], "ad_id": ad_id})
    return {"message": "Ad unsaved"}

@api_router.get("/user/saved-ads")
async def get_saved_ads(current_user: dict = Depends(get_current_user)):
    saved = await db.saved_ads.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(1000)
    ad_ids = [s["ad_id"] for s in saved]
    ads = await db.ads.find({"ad_id": {"$in": ad_ids}}, {"_id": 0}).to_list(1000)
    
    for ad in ads:
        user = await db.users.find_one({"user_id": ad["user_id"]}, {"_id": 0, "name": 1, "picture": 1})
        ad["owner"] = user
    
    return ads

# ============== GOGO POINTS ENDPOINTS ==============

@api_router.get("/user/points")
async def get_user_points(current_user: dict = Depends(get_current_user)):
    """Get user's Gogo Points balance"""
    return {"gogo_points": current_user.get("gogo_points", 0)}

@api_router.get("/user/transactions")
async def get_user_transactions(current_user: dict = Depends(get_current_user)):
    """Get user's transaction history"""
    transactions = await db.transactions.find(
        {"$or": [{"from_user_id": current_user["user_id"]}, {"to_user_id": current_user["user_id"]}]},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(100)
    
    for txn in transactions:
        if isinstance(txn.get("timestamp"), datetime):
            txn["timestamp"] = txn["timestamp"].isoformat()
    
    return transactions

@api_router.post("/user/transfer-points")
async def transfer_points(transfer: PointsTransfer, current_user: dict = Depends(get_current_user)):
    """Transfer Gogo Points to another user"""
    # Validate amount
    if transfer.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    # Check if sender has enough points
    sender_points = current_user.get("gogo_points", 0)
    if sender_points < transfer.amount:
        raise HTTPException(status_code=400, detail=f"Insufficient Gogo Points. You have {sender_points} points.")
    
    # Check if receiver exists
    receiver = await db.users.find_one({"user_id": transfer.to_user_id})
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    # Prevent self-transfer
    if transfer.to_user_id == current_user["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot transfer points to yourself")
    
    # Perform atomic transfer using MongoDB transaction-like operations
    # Deduct from sender
    result = await db.users.update_one(
        {"user_id": current_user["user_id"], "gogo_points": {"$gte": transfer.amount}},
        {"$inc": {"gogo_points": -transfer.amount}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Transfer failed. Insufficient points.")
    
    # Add to receiver
    await db.users.update_one(
        {"user_id": transfer.to_user_id},
        {"$inc": {"gogo_points": transfer.amount}}
    )
    
    # Record transaction
    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "from_user_id": current_user["user_id"],
        "to_user_id": transfer.to_user_id,
        "amount": transfer.amount,
        "transaction_type": "transfer",
        "description": f"Points transfer to {receiver.get('name', 'User')}",
        "timestamp": datetime.now(timezone.utc)
    }
    await db.transactions.insert_one(transaction_doc)
    
    # Get updated balance
    updated_user = await db.users.find_one({"user_id": current_user["user_id"]}, {"_id": 0, "gogo_points": 1})
    
    return {
        "message": f"Successfully transferred {transfer.amount} Gogo Points",
        "new_balance": updated_user.get("gogo_points", 0),
        "transaction_id": transaction_doc["transaction_id"]
    }

@api_router.get("/user/{user_id}/points")
async def get_other_user_points(user_id: str):
    """Get another user's Gogo Points balance (public info)"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "gogo_points": 1, "name": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"gogo_points": user.get("gogo_points", 0), "name": user.get("name", "")}

# ============== END GOGO POINTS ENDPOINTS ==============

@api_router.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    messages = await db.messages.find(
        {"$or": [{"sender_id": current_user["user_id"]}, {"receiver_id": current_user["user_id"]}]},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(1000)
    
    conversations = {}
    for msg in messages:
        other_user_id = msg["receiver_id"] if msg["sender_id"] == current_user["user_id"] else msg["sender_id"]
        key = f"{msg['ad_id']}_{other_user_id}"
        if key not in conversations:
            conversations[key] = {
                "ad_id": msg["ad_id"],
                "other_user_id": other_user_id,
                "last_message": msg["message"],
                "timestamp": msg["timestamp"],
                "seen": msg["seen"]
            }
    
    result = []
    for conv in conversations.values():
        user = await db.users.find_one({"user_id": conv["other_user_id"]}, {"_id": 0, "name": 1, "picture": 1})
        ad = await db.ads.find_one({"ad_id": conv["ad_id"]}, {"_id": 0, "title": 1, "images": 1})
        conv["other_user"] = user
        conv["ad"] = ad
        result.append(conv)
    
    return result

@api_router.get("/messages/{ad_id}/{other_user_id}")
async def get_messages(ad_id: str, other_user_id: str, current_user: dict = Depends(get_current_user)):
    messages = await db.messages.find(
        {
            "ad_id": ad_id,
            "$or": [
                {"sender_id": current_user["user_id"], "receiver_id": other_user_id},
                {"sender_id": other_user_id, "receiver_id": current_user["user_id"]}
            ]
        },
        {"_id": 0}
    ).sort("timestamp", 1).to_list(1000)
    
    await db.messages.update_many(
        {"ad_id": ad_id, "sender_id": other_user_id, "receiver_id": current_user["user_id"]},
        {"$set": {"seen": True}}
    )
    
    return messages

class MessageCreate(BaseModel):
    sender_id: str
    receiver_id: str
    ad_id: str
    message: str
    image: Optional[str] = None

@api_router.post("/messages/send")
async def send_message_http(msg: MessageCreate, current_user: dict = Depends(get_current_user)):
    """Send a message via HTTP (fallback for WebSocket issues)"""
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    message_doc = {
        "message_id": message_id,
        "sender_id": current_user["user_id"],
        "receiver_id": msg.receiver_id,
        "ad_id": msg.ad_id,
        "message": msg.message,
        "image": msg.image,
        "timestamp": datetime.now(timezone.utc),
        "seen": False
    }
    await db.messages.insert_one(message_doc)
    message_doc.pop("_id")
    message_doc["timestamp"] = message_doc["timestamp"].isoformat()
    return message_doc

@api_router.get("/uploads/{filename}")
async def serve_upload(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@api_router.get("/admin/ads")
async def admin_get_ads(current_user: dict = Depends(get_current_user)):
    ads = await db.ads.find({}, {"_id": 0}).to_list(1000)
    for ad in ads:
        user = await db.users.find_one({"user_id": ad["user_id"]}, {"_id": 0, "name": 1, "email": 1})
        ad["owner"] = user
    return ads

@api_router.put("/admin/ads/{ad_id}/status")
async def admin_update_ad_status(ad_id: str, status: str = Form(...), current_user: dict = Depends(get_current_user)):
    await db.ads.update_one({"ad_id": ad_id}, {"$set": {"status": status}})
    return {"message": "Status updated"}

@api_router.get("/admin/users")
async def admin_get_users(current_user: dict = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def join_chat(sid, data):
    # Use simpler room naming - just the ad_id so both users are in same room
    room = f"chat_{data['ad_id']}"
    await sio.enter_room(sid, room)
    print(f"User {data.get('user1')} joined room: {room}")
    
    # Mark all messages from the other user as seen
    if data.get('user1') and data.get('user2'):
        result = await db.messages.update_many(
            {
                "ad_id": data['ad_id'],
                "sender_id": data['user2'],
                "receiver_id": data['user1'],
                "seen": False
            },
            {"$set": {"seen": True}}
        )
        print(f"Marked {result.modified_count} messages as seen")
        
        # Notify sender that messages were seen
        await sio.emit("messages_seen", {
            "ad_id": data['ad_id'],
            "receiver_id": data['user1']
        }, room=room)

@sio.event
async def leave_chat(sid, data):
    room = f"chat_{data['ad_id']}"
    await sio.leave_room(sid, room)
    print(f"User left room: {room}")

@sio.event
async def send_message(sid, data):
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    message_doc = {
        "message_id": message_id,
        "sender_id": data["sender_id"],
        "receiver_id": data["receiver_id"],
        "ad_id": data["ad_id"],
        "message": data["message"],
        "image": data.get("image"),
        "timestamp": datetime.now(timezone.utc),
        "seen": False
    }
    await db.messages.insert_one(message_doc)
    message_doc.pop("_id")
    
    # Convert datetime to ISO string for JSON serialization
    message_doc["timestamp"] = message_doc["timestamp"].isoformat()
    
    # Emit to the ad's chat room - both users will receive it
    room = f"chat_{data['ad_id']}"
    await sio.emit("new_message", message_doc, room=room)
    print(f"Message sent to room {room}: {data['message'][:50]}")
    
    # Get sender info for notification
    sender = await db.users.find_one({"user_id": data["sender_id"]}, {"_id": 0, "name": 1})
    
    # Send a notification to the receiver's personal room
    await sio.emit("notification", {
        "message": message_doc,
        "sender_id": data["sender_id"],
        "sender_name": sender.get("name") if sender else "Someone",
        "receiver_id": data["receiver_id"]
    }, room=f"user_{data['receiver_id']}")
    print(f"Notification sent to user_{data['receiver_id']}")

@sio.event
async def join_user_room(sid, data):
    # Each user joins their personal room for notifications
    user_room = f"user_{data['user_id']}"
    await sio.enter_room(sid, user_room)
    print(f"User {data['user_id']} joined personal room: {user_room}")
from fastapi.responses import RedirectResponse
from urllib.parse import urlencode

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

@app.get("/auth/google")
async def google_login():
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
    return RedirectResponse(url)


from fastapi.responses import RedirectResponse

@app.get("/auth/google/callback")
async def google_callback(code: str):

    token_url = "https://oauth2.googleapis.com/token"

    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    token_response = requests.post(token_url, data=data)
    token_json = token_response.json()

    access_token = token_json.get("access_token")

    if not access_token:
        raise HTTPException(status_code=400, detail="Failed to get access token")

    userinfo_response = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    userinfo = userinfo_response.json()

    email = userinfo.get("email")
    name = userinfo.get("name")
    picture = userinfo.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Google login failed")

    user_doc = await db.users.find_one({"email": email})

    if not user_doc:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "gogo_points": 1000,
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(user_doc)
    else:
        user_id = user_doc["user_id"]

    session_token = f"session_{uuid.uuid4().hex}"

    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })

    redirect = RedirectResponse("https://rentwala.vercel.app")

    redirect.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )

    return redirect


app.include_router(api_router)
import socketio

socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
app = socket_app


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
