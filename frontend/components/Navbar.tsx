"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div className="w-full bg-white border-b px-6 py-4 flex justify-between items-center">

      <Link href="/" className="text-xl font-bold">
        RentWala
      </Link>

      <div className="flex gap-6">

        <Link href="/dashboard">Dashboard</Link>

        <Link href="/create-ad">Post Ad</Link>

        <Link href="/inbox">Inbox</Link>

        <Link href="/profile">Profile</Link>

      </div>

    </div>
  );
}
