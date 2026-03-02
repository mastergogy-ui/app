'use client';
import { api } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { useState } from 'react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const res = await api.post('/auth/admin/login', { username, password });
      setToken('adminToken', res.data.token);
      window.location.href = '/admin';
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Admin login failed');
    }
  };

  return (
    <form onSubmit={submit} className="card mx-auto max-w-md space-y-3">
      <h1 className="text-2xl font-semibold">Admin Login</h1>
      <input className="w-full rounded bg-slate-800 p-2" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input className="w-full rounded bg-slate-800 p-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className="w-full rounded bg-purple-700 p-2">Login</button>
      {message && <p className="text-rose-400">{message}</p>}
    </form>
  );
}
