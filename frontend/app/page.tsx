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

   fetch(process.env.NEXT_PUBLIC_API_URL + "/ads")
      .then(res => res.json())
      .then(data => setAds(data))
      .catch(() => console.log("API error"));

  }, []);

  return (

    <div style={{ padding: "40px" }}>

      <h1>RentWala Marketplace</h1>

      <div style={{ marginTop: "30px" }}>

        {ads.length === 0 ? (

          <p>No ads available</p>

        ) : (

          ads.map(ad => (

            <div
              key={ad._id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "8px"
              }}
            >

              <h3>{ad.title}</h3>
              <p>{ad.description}</p>
              <b>₹{ad.price}</b>

            </div>

          ))

        )}

      </div>

    </div>

  );

}
