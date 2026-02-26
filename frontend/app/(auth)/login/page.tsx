'use client';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';

export default function LoginPage() {
  const { register, handleSubmit } = useForm<{ identifier: string; password: string }>();

  const onSubmit = handleSubmit(async (values) => {
    await api.post('/auth/login', values);
    window.location.href = '/dashboard';
  });

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto bg-white p-4 rounded border space-y-3">
      <h1 className="text-xl font-semibold">Login</h1>
      <input {...register('identifier', { required: true })} className="w-full border rounded px-3 py-2" placeholder="Email or phone" />
      <input {...register('password', { required: true })} type="password" className="w-full border rounded px-3 py-2" placeholder="Password" />
      <button className="w-full bg-black text-white py-2 rounded">Login</button>
    </form>
  );
}
