"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [stats, setStats] = useState(null);

  const loadStats = async () => {
    const response = await api.get("/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStats(response.data);
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-3">
      <h1 className="text-xl font-semibold">Admin panel (mastergogy@gmail.com)</h1>
      <input className="border p-2 w-full" placeholder="Admin JWT token" value={token} onChange={(e) => setToken(e.target.value)} />
      <button className="bg-blue-700 text-white px-4 py-2 rounded" onClick={loadStats}>Load Dashboard</button>
      {stats && <pre className="bg-slate-900 text-white p-3 rounded">{JSON.stringify(stats, null, 2)}</pre>}
    </div>
  );
}
