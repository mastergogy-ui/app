'use client';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const token = typeof window !== 'undefined' ? getToken('adminToken') : '';
  const [analytics, setAnalytics] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [form, setForm] = useState({ teamA: '', teamB: '', startsAt: '' });

  const headers = { Authorization: `Bearer ${token}` };

  const refresh = async () => {
    const [a, m] = await Promise.all([
      api.get('/admin/analytics', { headers }),
      api.get('/admin/matches', { headers })
    ]);
    setAnalytics(a.data);
    setMatches(m.data);
  };

  useEffect(() => {
    if (!token) return;
    refresh();
  }, [token]);

  if (!token) return <p className="card">Admin login required.</p>;

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        {analytics && <p>Total users: {analytics.totalUsers} | Active predictions: {analytics.activePredictions}</p>}
      </section>

      <section className="card space-y-2">
        <h2 className="text-xl font-semibold">Create Match</h2>
        <input className="rounded bg-slate-800 p-2" placeholder="Team A" onChange={(e) => setForm((s) => ({ ...s, teamA: e.target.value }))} />
        <input className="rounded bg-slate-800 p-2" placeholder="Team B" onChange={(e) => setForm((s) => ({ ...s, teamB: e.target.value }))} />
        <input className="rounded bg-slate-800 p-2" type="datetime-local" onChange={(e) => setForm((s) => ({ ...s, startsAt: e.target.value }))} />
        <button
          className="rounded bg-cyan-700 px-3 py-2"
          onClick={async () => {
            await api.post('/admin/matches', form, { headers });
            await refresh();
          }}
        >
          Create
        </button>
      </section>

      <section className="card">
        <h2 className="mb-3 text-xl font-semibold">Manage Matches</h2>
        <div className="space-y-2">
          {matches.map((match) => (
            <div key={match._id} className="rounded border border-slate-700 p-3">
              <p>{match.teamA} vs {match.teamB} ({match.status})</p>
              <div className="mt-2 flex gap-2">
                <button className="rounded bg-amber-700 px-2 py-1" onClick={async () => { await api.patch(`/admin/matches/${match._id}/close`, {}, { headers }); await refresh(); }}>Close</button>
                <button className="rounded bg-emerald-700 px-2 py-1" onClick={async () => { await api.patch(`/admin/matches/${match._id}/winner`, { winner: 'teamA' }, { headers }); await refresh(); }}>Winner A</button>
                <button className="rounded bg-indigo-700 px-2 py-1" onClick={async () => { await api.patch(`/admin/matches/${match._id}/winner`, { winner: 'teamB' }, { headers }); await refresh(); }}>Winner B</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
