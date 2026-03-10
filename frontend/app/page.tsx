"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useAuth } from "../context/AuthContext";

type Ad = {
  _id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
};

export default function HomePage() {

  const { user, logout } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {

    const loadAds = async () => {

      try {

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ads`);
        const data = await res.json();

        setAds(data || []);

      } catch (err) {

        console.log("Failed to load ads", err);
        setAds([]);

      }

    };

    loadAds();

  }, []);

  return (

    <div style={{fontFamily:"Arial"}}>

      <div style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        padding:"20px",
        borderBottom:"1px solid #eee"
      }}>

        <h2>RentWala</h2>

        <div style={{display:"flex",gap:"10px",alignItems:"center"}}>

          {user ? (

            <>
              <span>Hi {user.name}</span>

              <button
                onClick={logout}
                style={{
                  background:"#ff4d4d",
                  color:"white",
                  padding:"8px 14px",
                  borderRadius:"6px",
                  border:"none",
                  cursor:"pointer"
                }}
              >
                Logout
              </button>

              <Link href="/post-ad">
                <button
                  style={{
                    background:"#002f34",
                    color:"white",
                    padding:"10px 18px",
                    borderRadius:"6px",
                    border:"none",
                    cursor:"pointer"
                  }}
                >
                  + SELL
                </button>
              </Link>
            </>

          ) : (

            <GoogleLoginButton/>

          )}

        </div>

      </div>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",
        gap:"20px",
        padding:"20px"
      }}>

        {ads.map((ad)=>(

          <Link
            key={ad._id}
            href={`/listings/${ad._id}`}
            style={{textDecoration:"none",color:"black"}}
          >

            <div style={{
              border:"1px solid #eee",
              borderRadius:"10px",
              overflow:"hidden"
            }}>

              <div style={{
                height:"160px",
                background:"#f3f3f3",
                display:"flex",
                alignItems:"center",
                justifyContent:"center"
              }}>

                {ad.image ? (
                  <img
                    src={ad.image}
                    style={{
                      width:"100%",
                      height:"160px",
                      objectFit:"cover"
                    }}
                  />
                ) : (
                  <span style={{fontSize:"40px"}}>📦</span>
                )}

              </div>

              <div style={{padding:"15px"}}>

                <h3>₹{ad.price}</h3>
                <p style={{fontWeight:"bold"}}>{ad.title}</p>
                <p style={{color:"#666",fontSize:"14px"}}>
                  {ad.description}
                </p>

              </div>

            </div>

          </Link>

        ))}

      </div>

    </div>
  );
}
