'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const categories = ['Rent a Friend', 'Rent a Bike', 'Rent a Car', 'Rent a Property'];

export default function Navbar() {
  const [me, setMe] = useState<any>(null);
  useEffect(() => {
    api.get('/auth/me').then((r) => setMe(r.data.user)).catch(() => setMe(null));
  }, []);

  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl">RentWala</Link>
        <div className="flex gap-4 items-center text-sm">
          <select className="border rounded px-2 py-1" onChange={(e) => (window.location.href = `/?category=${encodeURIComponent(e.target.value)}`)}>
            <option value="">Categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          {!me ? (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <button onClick={() => api.post('/auth/logout').then(() => window.location.reload())}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
