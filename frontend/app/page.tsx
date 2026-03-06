'use client';

import ListingCard from "../components/ListingCard";
import Link from "next/link";

const categories = [
  { name: "Cars", icon: "🚗" },
  { name: "Properties", icon: "🏠" },
  { name: "Mobiles", icon: "📱" },
  { name: "Fashion", icon: "👕" },
  { name: "Bikes", icon: "🏍️" },
  { name: "Electronics", icon: "💻" },
  { name: "Commercial Vehicles", icon: "🚚" },
  { name: "Furniture", icon: "🛋️" },
  { name: "Rent a Friend", icon: "🤝" },
];

export default function HomePage() {
  return (
    <div className="space-y-6">

      {/* Category Slider */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="min-w-[90px] flex flex-col items-center justify-center bg-slate-800 p-4 rounded-lg cursor-pointer hover:bg-slate-700"
          >
            <span className="text-3xl">{cat.icon}</span>
            <p className="text-sm mt-2 text-center">{cat.name}</p>
          </div>
        ))}
      </div>

      {/* Listings */}
      <h2 className="text-xl font-semibold">Fresh rentals</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ListingCard />
        <ListingCard />
        <ListingCard />
        <ListingCard />
      </div>

      {/* Floating Rent Button */}
      <Link href="/post-ad">
        <button className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-semibold shadow-xl text-white">
          + RENT
        </button>
      </Link>

    </div>
  );
}
