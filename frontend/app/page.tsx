"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GoogleLoginButton from "../components/GoogleLoginButton";

type Ad = {
  _id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
};

export default function HomePage() {

  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {

    const loadAds = async () => {

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads`);
      const data = await res.json();

      setAds(data || []);

    };

    loadAds();

  }, []);

  return (

    <div style={{fontFamily:"Arial"}}>

      <div style={{
        display:"flex",
        justifyContent:"space-between",
        padding:"20px",
        borderBottom:"1px solid #eee"
      }}>

        <h2>RentWala</h2>

        <Link href="/post-ad">
          <button style={{
            background:"#002f34",
            color:"white",
            padding:"10px 18px",
            borderRadius:"6px",
            border:"none",
            cursor:"pointer"
          }}>
            + SELL
          </button>
        </Link>

      </div>

      <div style={{padding:"20px"}}>
        <GoogleLoginButton/>
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
