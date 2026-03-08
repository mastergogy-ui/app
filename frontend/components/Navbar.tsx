"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div className="w-full bg-white border-b px-6 py-4 flex justify-between items-center">

      <Link href="/" className="text-xl font-bold">
        Mahalakshmi
      </Link>

      <div className="flex gap-4">

        <Link href="/dashboard" className="text-gray-700 hover:text-black">
          Dashboard
        </Link>

        <Link href="/create-ad" className="text-gray-700 hover:text-black">
          Post Ad
        </Link>

        <Link href="/inbox" className="text-gray-700 hover:text-black">
          Inbox
        </Link>

        <Link href="/profile" className="text-gray-700 hover:text-black">
          Profile
        </Link>

      </div>

    </div>
  );
}
