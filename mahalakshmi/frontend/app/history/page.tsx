'use client';
import api from "../../lib/api";
import { getToken } from "../../lib/auth";
import { useEffect, useState } from 'react';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const token = typeof window !== 'undefined' ? getToken('userToken') : '';

  useEffect(() => {
    if (!token) return;
    api.get('/user/history', { headers: { Authorization: `Bearer ${token}` } }).then((res) => setHistory(res.data));
  }, [token]);

  return (
    <section className="card">
      <h1 className="mb-3 text-2xl font-bold">Match History</h1>
      <div className="space-y-2">
        {history.map((item) => (
          <div key={item._id} className="rounded border border-slate-700 p-3">
            <p>{item.match?.teamA} vs {item.match?.teamB}</p>
            <p>Prediction: {item.predictedWinner} | Outcome: {item.outcome}</p>
            <p>Points used: {item.pointsUsed} | Points change: {item.pointsChange}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
