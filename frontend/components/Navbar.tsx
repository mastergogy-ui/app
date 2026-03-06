'use client';

import { useState } from "react";

export default function Navbar() {

  const [location, setLocation] = useState("Select Location");

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation("Your Location");
    });
  };

  return (
   <nav className="sticky top-0 z-50 bg-white text-black p-4 shadow flex items-center justify-between">

      {/* Logo */}
      <h1 className="text-2xl font-bold text-blue-600">
        Rent Wala
      </h1>

      {/* Location */}
      <button
        onClick={detectLocation}
        className="border px-3 py-1 rounded"
      >
        📍 {location}
      </button>

      {/* Search */}
      <input
        className="border px-3 py-1 rounded w-1/3"
        placeholder="Search rentals..."
      />

    </nav>
  );
}
