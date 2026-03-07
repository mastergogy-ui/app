'use client';

import { useEffect, useState } from "react";
import { api } from "../../lib/api";

type Ad = {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
};

export default function DashboardPage() {

  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const loadAds = async () => {
      try {

        const res = await api.get("/ads");

        setAds(res.data.ads || []);

      } catch (error) {
        console.error("Failed to load ads", error);
      }
    };

    loadAds();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">

      <h1 className="text-2xl font-bold mb-4">My Listings</h1>

      {ads.length === 0 && (
        <p>No ads yet.</p>
      )}

      {ads.map((ad) => (
        <div key={ad.id} className="border p-3 rounded mb-3">

          <h2 className="font-semibold text-lg">{ad.title}</h2>

          <p>{ad.category}</p>

          <p>₹ {ad.price}</p>

          <p className="text-gray-600">{ad.description}</p>

        </div>
      ))}

    </div>
  );
}
