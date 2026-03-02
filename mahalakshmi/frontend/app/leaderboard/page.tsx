'use client';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const token = typeof window !== 'undefined' ? getToken('userToken') : '';

  useEffect(() => {
    if (!token) return;
    api.get('/user/leaderboard', { headers: { Authorization: `Bearer ${token}` } }).then((res) => setLeaders(res.data));
  }, [token]);

  return (
    <section className="card">
      <h1 className="mb-3 text-2xl font-bold">Leaderboard</h1>
      {leaders.map((leader, index) => (
        <div key={leader._id} className="mb-2 flex justify-between rounded border border-slate-700 p-3">
          <p>#{index + 1} {leader.name}</p>
          <p className="text-cyan-300">{leader.points} pts</p>
        </div>
      ))}
    </section>
  );
}
