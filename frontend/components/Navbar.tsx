"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "./GoogleLoginButton";

export default function Navbar() {

  const { user, logout } = useAuth();

  return (
    <div className="w-full bg-white border-b px-6 py-4 flex justify-between items-center">

      <Link href="/" className="text-xl font-bold">
        RentWala
      </Link>

      <div className="flex gap-6 items-center">

        <Link href="/dashboard">Dashboard</Link>

        <Link href="/post-ad">Post Ad</Link>

        <Link href="/inbox">Inbox</Link>

        {user ? (
          <>
            <Link href="/profile">
              {user.name}
            </Link>

            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <GoogleLoginButton />
        )}

      </div>

    </div>
  );
}
