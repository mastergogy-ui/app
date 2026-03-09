"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Ad = {
_id: string;
title: string;
description: string;
price: number;
};

export default function HomePage() {
const [ads, setAds] = useState<Ad[]>([]);

const categories = [
{ name: "Cars", icon: "🚗" },
{ name: "Mobiles", icon: "📱" },
{ name: "Properties", icon: "🏠" },
{ name: "Bikes", icon: "🏍️" },
{ name: "Electronics", icon: "💻" },
{ name: "Furniture", icon: "🪑" },
{ name: "Jobs", icon: "💼" },
{ name: "Pets", icon: "🐶" }
];

useEffect(() => {
fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads`)
.then((res) => res.json())
.then((data) => setAds(data))
.catch((err) => console.error(err));
}, []);

return (
<div style={{ fontFamily: "Arial" }}>

```
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "20px",
      borderBottom: "1px solid #eee"
    }}
  >
    <h2>RentWala</h2>
    <button
      style={{
        background: "#002f34",
        color: "white",
        padding: "10px 18px",
        borderRadius: "6px",
        border: "none"
      }}
    >
      + SELL
    </button>
  </div>

  <div style={{ padding: "20px" }}>
    <input
      placeholder="Search items..."
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ddd"
      }}
    />
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "20px",
      padding: "20px"
    }}
  >
    {categories.map((c, i) => (
      <div
        key={i}
        style={{
          textAlign: "center",
          border: "1px solid #eee",
          padding: "15px",
          borderRadius: "10px"
        }}
      >
        <div style={{ fontSize: "30px" }}>{c.icon}</div>
        <p>{c.name}</p>
      </div>
    ))}
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
      gap: "20px",
      padding: "20px"
    }}
  >
    {ads.map((ad) => (
      <Link
        key={ad._id}
        href={`/ad/${ad._id}`}
        style={{ textDecoration: "none", color: "black" }}
      >
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: "10px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              height: "160px",
              background: "#f3f3f3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px"
            }}
          >
            📦
          </div>

          <div style={{ padding: "15px" }}>
            <h3>₹{ad.price}</h3>
            <p style={{ fontWeight: "bold" }}>{ad.title}</p>
            <p style={{ color: "#666", fontSize: "14px" }}>
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
