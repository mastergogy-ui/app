"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

const categories = [
  "All",
  "Bike",
  "Car",
  "House",
  "Mobile",
  "Electronics",
  "Furniture",
  "rent a friend",
  "Camera",
];

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([]);
  const [filteredAds, setFilteredAds] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

 const fetchAds = async () => {
  try {
    const res = await api.get("/ads");

    const data = res.data.ads || res.data;

    setAds(data);
    setFilteredAds(data);

  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {
    fetchAds();
  }, []);

  const filterCategory = (cat: string) => {
    setSelectedCategory(cat);

    if (cat === "All") {
      setFilteredAds(ads);
    } else {
      setFilteredAds(ads.filter((ad) => ad.category === cat));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-3xl font-bold mb-6">Latest Rentals</h1>

      {/* CATEGORY BAR */}

      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => filterCategory(cat)}
            className={`px-4 py-2 rounded-full border ${
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ADS GRID */}

      {filteredAds.length === 0 && (
        <p className="text-gray-500">No ads posted yet</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredAds.map((ad) => (
          <div
            key={ad._id}
            className="bg-white p-5 rounded-lg shadow"
          >
            <h2 className="text-xl font-bold">{ad.title}</h2>

            <p className="text-gray-500">{ad.category}</p>

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

      {/* FLOATING BUTTON */}

      <a
        href="/post-ad"
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg"
      >
        + Post Ad
      </a>

    </div>
  );
}
