"use client";

import { useEffect, useState } from "react";

interface Ad {
  _id: string;
  title: string;
  description: string;
  price: number;
}

export default function HomePage() {

  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads`)
      .then(res => res.json())
      .then(data => setAds(data))
      .catch(err => console.log(err));
  }, []);

  return (

    <div style={{fontFamily:"Arial"}}>

      {/* HEADER */}
      <div style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        padding:"15px 30px",
        borderBottom:"1px solid #eee"
      }}>
        <h2>RentWala</h2>

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

      </div>

      {/* SEARCH */}
      <div style={{padding:"20px 30px"}}>
        <input
          placeholder="Search items..."
          style={{
            width:"100%",
            padding:"12px",
            borderRadius:"8px",
            border:"1px solid #ddd"
          }}
        />
      </div>

      {/* ADS GRID */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",
        gap:"20px",
        padding:"20px 30px"
      }}>

        {ads.map(ad => (

          <div key={ad._id} style={{
            border:"1px solid #eee",
            borderRadius:"10px",
            overflow:"hidden",
            background:"white"
          }}>

            <div style={{
              height:"160px",
              background:"#f5f5f5"
            }}></div>

            <div style={{padding:"15px"}}>

              <h3 style={{marginBottom:"8px"}}>
                ₹{ad.price}
              </h3>

              <p style={{fontWeight:"bold"}}>
                {ad.title}
              </p>

              <p style={{color:"#666",fontSize:"14px"}}>
                {ad.description}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}
