'use client';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const { register, handleSubmit } = useForm<{ name: string; email?: string; phone?: string; password: string }>();
  const onSubmit = handleSubmit(async (values) => {
    await api.post('/auth/register', values);
    window.location.href = '/dashboard';
  });

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto bg-white p-4 rounded border space-y-3">
      <h1 className="text-xl font-semibold">Register</h1>
      <input {...register('name', { required: true })} className="w-full border rounded px-3 py-2" placeholder="Name" />
      <input {...register('email')} className="w-full border rounded px-3 py-2" placeholder="Email (optional if phone)" />
      <input {...register('phone')} className="w-full border rounded px-3 py-2" placeholder="Phone (optional if email)" />
      <input {...register('password', { required: true })} type="password" className="w-full border rounded px-3 py-2" placeholder="Password" />
      <button className="w-full bg-black text-white py-2 rounded">Create account</button>
    </form>
  );
}
