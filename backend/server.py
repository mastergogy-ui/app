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
api_router = APIRouter(prefix="/api")

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[dict] = None
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
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(user_doc)
    
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

@api_router.get("/auth/session")
async def create_session(request: Request):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    try:
        response = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        response.raise_for_status()
        session_data = response.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get session data: {str(e)}")
    
    user_id = session_data.get("id")
    email = session_data.get("email")
    name = session_data.get("name")
    picture = session_data.get("picture")
    session_token = session_data.get("session_token")
    
    user_doc = await db.users.find_one({"email": email})
    if not user_doc:
        user_id_custom = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id_custom,
            "email": email,
            "name": name,
            "picture": picture,
            "phone": None,
            "location": None,
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(user_doc)
        user_doc.pop("_id")
    else:
        user_id_custom = user_doc["user_id"]
        await db.users.update_one(
            {"user_id": user_id_custom},
            {"$set": {"name": name, "picture": picture}}
        )
        user_doc = await db.users.find_one({"user_id": user_id_custom}, {"_id": 0})
    
    session_doc = {
        "user_id": user_id_custom,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    if "created_at" in user_doc and isinstance(user_doc["created_at"], datetime):
        user_doc["created_at"] = user_doc["created_at"].isoformat()
    
    return {"user": user_doc, "session_token": session_token}

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
    room = f"{data['ad_id']}_{data['user1']}_{data['user2']}"
    await sio.enter_room(sid, room)

@sio.event
async def send_message(sid, data):
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    message_doc = {
        "message_id": message_id,
        "sender_id": data["sender_id"],
        "receiver_id": data["receiver_id"],
        "ad_id": data["ad_id"],
        "message": data["message"],
        "timestamp": datetime.now(timezone.utc),
        "seen": False
    }
    await db.messages.insert_one(message_doc)
    message_doc.pop("_id")
    
    room = f"{data['ad_id']}_{data['sender_id']}_{data['receiver_id']}"
    room2 = f"{data['ad_id']}_{data['receiver_id']}_{data['sender_id']}"
    await sio.emit("new_message", message_doc, room=room)
    await sio.emit("new_message", message_doc, room=room2)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["https://rentspot-83.preview.emergentagent.com", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()