"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">
        Admin panel (mastergogy@gmail.com)
      </h1>

      <input
        className="border p-2 w-full"
        placeholder="Admin JWT token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />

      <button
        className="bg-blue-700 text-white px-4 py-2 rounded"
        onClick={loadStats}
        disabled={loading}
      >
        {loading ? "Loading..." : "Load Dashboard"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {stats && (
        <pre className="bg-slate-900 text-white p-3 rounded overflow-x-auto text-sm leading-relaxed">
          {JSON.stringify(stats, null, 2)}
        </pre>
      )}
    </div>
  );
}
