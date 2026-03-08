"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {

  const [search,setSearch] = useState("");
  const router = useRouter();

  const handleSearch = () => {

    if(!search) return;

    router.push(`/?search=${search}`);

  };

  return (

    <div className="w-full bg-white border-b px-6 py-4 flex items-center justify-between">

      <Link href="/">
        <h1 className="text-2xl font-bold text-blue-600">
          RentWala
        </h1>
      </Link>

      {/* SEARCH */}

      <div className="flex w-1/2">

        <input
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        placeholder="Search cars, bikes, houses..."
        className="w-full border px-4 py-2 rounded-l-lg"
        />

        <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-4 rounded-r-lg"
        >
          Search
        </button>

      </div>

      {/* NAV */}

      <div className="flex gap-5 items-center">

        <Link href="/dashboard">
          Dashboard
        </Link>

        <Link
        href="/post-ad"
        className="bg-red-600 text-white px-5 py-2 rounded-full"
        >
          + Post Ad
        </Link>

      </div>

    </div>

  );

}
