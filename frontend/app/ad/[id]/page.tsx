"use client";

import { useEffect, useState } from "react";

interface Ad {
_id: string;
title: string;
description: string;
price: number;
}

export default function AdDetail({ params }: any) {

const [ad, setAd] = useState<Ad | null>(null);

useEffect(() => {

```
fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads`)
  .then(res => res.json())
  .then(data => {

    const found = data.find((a:any)=>a._id === params.id);
    setAd(found);

  });
```

}, []);

if(!ad) return <p style={{padding:"40px"}}>Loading...</p>;

return (

```
<div style={{padding:"40px",fontFamily:"Arial"}}>

  <div style={{
    height:"300px",
    background:"#eee",
    borderRadius:"10px",
    marginBottom:"20px",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    fontSize:"60px"
  }}>
    📦
  </div>

  <h1>{ad.title}</h1>

  <h2>₹{ad.price}</h2>

  <p>{ad.description}</p>

  <button style={{
    marginTop:"20px",
    padding:"12px 20px",
    background:"#002f34",
    color:"white",
    border:"none",
    borderRadius:"6px"
  }}>
    Chat with Seller
  </button>

</div>
```

);
}
