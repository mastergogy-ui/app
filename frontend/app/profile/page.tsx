'use client';
import { api } from '../../lib/api'
import { getToken } from "../../lib/auth";
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const token = typeof window !== 'undefined' ? getToken('userToken') : '';

  useEffect(() => {
    if (!token) return;
    api.get('/user/profile', { headers: { Authorization: `Bearer ${token}` } }).then((res) => setProfile(res.data));
  }, [token]);

  if (!profile) return <p className="card">Loading profile...</p>;

  return (
    <section className="card space-y-2">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p>Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
      <p>Points: {profile.points}</p>
      <p>Status: {profile.isActive ? 'Active' : 'Inactive'} {profile.isBanned ? '(Banned)' : ''}</p>
    </section>
  );
}
