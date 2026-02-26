"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function CategoryPage({ params }) {
  const [ads, setAds] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        setError("");
        const location = JSON.parse(localStorage.getItem("rentwala_location") || "{}");
        const response = await api.get("/ads", {
          params: {
            category: params.slug,
            city: location.city,
            q,
            page: 1,
            limit: 12,
          },
        });
        setAds(response.data.ads || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load ads");
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [params.slug, q]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold capitalize">{params.slug.replaceAll("-", " ")}</h1>
      <input className="border p-2 w-full max-w-md" placeholder="Search in this category" value={q} onChange={(e) => setQ(e.target.value)} />
      {loading && <p className="text-sm text-slate-600">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid md:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <div key={ad._id} className="border rounded p-3 bg-white">
            <div className="font-semibold">{ad.title}</div>
            <div className="text-sm text-slate-600">₹ {ad.price}</div>
            <div className="text-xs mt-1">{ad.location?.city}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
