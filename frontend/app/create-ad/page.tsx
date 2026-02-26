'use client';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';

type FormValues = {
  title: string;
  description: string;
  category: 'Rent a Friend' | 'Rent a Bike' | 'Rent a Car' | 'Rent a Property';
  price: number;
  city: string;
  state: string;
  country: string;
  lat?: number;
  lng?: number;
  images: FileList;
};

export default function CreateAdPage() {
  const { register, handleSubmit, setValue } = useForm<FormValues>();

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setValue('lat', pos.coords.latitude);
      setValue('lng', pos.coords.longitude);
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    const fd = new FormData();
    fd.append('title', values.title);
    fd.append('description', values.description);
    fd.append('category', values.category);
    fd.append('price', String(values.price));
    fd.append('location', JSON.stringify({ city: values.city, state: values.state, country: values.country, coordinates: { lat: values.lat, lng: values.lng } }));
    Array.from(values.images || []).slice(0, 5).forEach((file) => fd.append('images', file));
    await api.post('/ads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    window.location.href = '/dashboard';
  });

  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto bg-white border rounded p-4 space-y-3">
      <h1 className="text-xl font-semibold">Create Listing</h1>
      <input {...register('title', { required: true, maxLength: 60 })} className="w-full border rounded px-3 py-2" placeholder="Title" />
      <textarea {...register('description', { required: true })} className="w-full border rounded px-3 py-2" placeholder="Description (max 100 words)" />
      <select {...register('category', { required: true })} className="w-full border rounded px-3 py-2">
        <option value="">Select category</option>
        <option>Rent a Friend</option>
        <option>Rent a Bike</option>
        <option>Rent a Car</option>
        <option>Rent a Property</option>
      </select>
      <input {...register('price', { required: true, min: 0 })} type="number" className="w-full border rounded px-3 py-2" placeholder="Price/day" />
      <div className="grid grid-cols-3 gap-2">
        <input {...register('city')} className="border rounded px-3 py-2" placeholder="City" />
        <input {...register('state')} className="border rounded px-3 py-2" placeholder="State" />
        <input {...register('country')} className="border rounded px-3 py-2" placeholder="Country" />
      </div>
      <button type="button" onClick={detectLocation} className="border px-3 py-2 rounded">Detect Current Location</button>
      <input {...register('images')} type="file" multiple accept="image/png,image/jpeg,image/webp" className="w-full" />
      <button className="w-full bg-black text-white py-2 rounded">Post Ad</button>
    </form>
  );
}
