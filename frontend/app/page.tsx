"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    try {
      const res = await api.get("/ads");
      setAds(res.data);
    } catch (err) {
      console.error("Failed to fetch ads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6">Latest Rentals</h1>

      {loading && <p>Loading ads...</p>}

      {!loading && ads.length === 0 && (
        <p>No ads posted yet</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <div
            key={ad._id}
            className="bg-white p-5 rounded-lg shadow"
          >
            <h2 className="text-xl font-bold">{ad.title}</h2>

            <p className="text-gray-600">{ad.category}</p>

            <p className="text-green-600 font-semibold">
              ₹ {ad.price}
            </p>

            <p>{ad.location}</p>

            <p className="text-sm text-gray-500 mt-2">
              {ad.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
