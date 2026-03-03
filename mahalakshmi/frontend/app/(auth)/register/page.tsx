'use client';
import api from "../../../lib/api";
import { getToken, setToken, clearTokens } from "../../../lib/auth";
export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/register', { name, email, password });
      setToken('userToken', response.data.token);
      window.location.href = '/dashboard';
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleRegister} className="card mx-auto max-w-md space-y-3">
      <h1 className="text-2xl font-semibold">Create Account</h1>
      <input className="w-full rounded bg-slate-800 p-2" placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input className="w-full rounded bg-slate-800 p-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded bg-slate-800 p-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className="w-full rounded bg-cyan-600 p-2">Register</button>
      {message && <p className="text-rose-400">{message}</p>}
    </form>
  );
}
