'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clearTokens } from '@/lib/auth';

export default function Navbar() {
  const [hasUserToken, setHasUserToken] = useState(false);
  const [hasAdminToken, setHasAdminToken] = useState(false);

  useEffect(() => {
    setHasUserToken(Boolean(localStorage.getItem('userToken')));
    setHasAdminToken(Boolean(localStorage.getItem('adminToken')));
  }, []);

  return (
    <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between p-4 text-slate-100">
        <Link href="/" className="text-xl font-bold text-cyan-400">GoGo Fantasy Points</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/history">History</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/admin">Admin</Link>
          {(hasUserToken || hasAdminToken) && (
            <button
              onClick={() => {
                clearTokens();
                window.location.href = '/';
              }}
              className="rounded bg-slate-800 px-3 py-1"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
