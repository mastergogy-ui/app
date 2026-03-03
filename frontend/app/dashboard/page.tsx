'use client';
import { api } from '../../lib/api'
import { getToken } from "../../lib/auth";
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [pointsByMatch, setPointsByMatch] = useState<Record<string, number>>({});

  const token = typeof window !== 'undefined' ? getToken('userToken') : '';

  useEffect(() => {
    if (!token) return;
    api.get('/user/dashboard', { headers: { Authorization: `Bearer ${token}` } }).then((res) => setData(res.data));
  }, [token]);

  const makePrediction = async (matchId: string, predictedWinner: 'teamA' | 'teamB') => {
    try {
      await api.post(
        '/user/predict',
        { matchId, predictedWinner, pointsUsed: Number(pointsByMatch[matchId] || 0) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Prediction submitted');
      const refreshed = await api.get('/user/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      setData(refreshed.data);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Prediction failed');
    }
  };

  if (!token) return <p className="card">Please login first.</p>;
  if (!data) return <p className="card">Loading dashboard...</p>;

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-2xl font-bold">Welcome, {data.user.name}</h1>
        <p className="mt-2 text-cyan-300">Current virtual points: {data.user.points}</p>
        <p className="mt-2 text-sm text-amber-300">{data.disclaimer}</p>
      </section>
      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Upcoming Matches</h2>
        {data.upcomingMatches.map((match: any) => (
          <div key={match._id} className="rounded border border-slate-700 p-3">
            <p>{match.teamA} vs {match.teamB}</p>
            <p className="text-xs text-slate-400">Starts: {new Date(match.startsAt).toLocaleString()}</p>
            {!match.predictionClosed ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  type="number"
                  min={1}
                  placeholder="Points"
                  className="rounded bg-slate-800 p-2"
                  onChange={(e) => setPointsByMatch((prev) => ({ ...prev, [match._id]: Number(e.target.value) }))}
                />
                <button className="rounded bg-cyan-700 px-3 py-2" onClick={() => makePrediction(match._id, 'teamA')}>Pick {match.teamA}</button>
                <button className="rounded bg-indigo-700 px-3 py-2" onClick={() => makePrediction(match._id, 'teamB')}>Pick {match.teamB}</button>
              </div>
            ) : (
              <p className="mt-2 text-amber-300">Prediction closed</p>
            )}
          </div>
        ))}
        {message && <p className="text-sm text-emerald-400">{message}</p>}
      </section>
    </div>
  );
}
