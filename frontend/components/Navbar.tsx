"use client";

import Link from "next/link";

export default function Navbar() {

  return (

    <div className="w-full bg-white border-b px-6 py-4 flex justify-between items-center">

      <Link href="/">
        <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">
          RentWala
        </h1>
      </Link>

      <div className="flex items-center gap-6 text-gray-700">

        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>

        <Link href="/dashboard" className="hover:text-blue-600">
          Dashboard
        </Link>

        <Link
          href="/post-ad"
          className="bg-red-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-red-700"
        >
          + Post Ad
        </Link>

        <Link href="/leaderboard" className="hover:text-blue-600">
          Leaderboard
        </Link>

        <Link href="/profile" className="hover:text-blue-600">
          Profile
        </Link>

      </div>

    </div>

  );

}
