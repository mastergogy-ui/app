'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Ad } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  useEffect(() => {
    api.get('/ads/mine').then((res) => setAds(res.data));
  }, []);

  const remove = async (id: string) => {
    await api.delete(`/ads/${id}`);
    setAds((prev) => prev.filter((ad) => ad._id !== id));
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between"><h1 className="text-2xl font-semibold">My Listings</h1><Link href="/create-ad" className="bg-black text-white px-4 py-2 rounded">Create Ad</Link></div>
      {ads.map((ad) => (
        <div key={ad._id} className="bg-white border p-4 rounded flex justify-between">
          <div><h3 className="font-medium">{ad.title}</h3><p className="text-sm text-gray-600">₹{ad.price}/day</p></div>
          <div className="space-x-3"><button onClick={() => remove(ad._id)} className="text-red-600">Delete</button></div>
        </div>
      ))}
    </section>
  );
}
