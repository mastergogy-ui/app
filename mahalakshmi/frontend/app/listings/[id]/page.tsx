import Image from 'next/image';
import { Ad } from '@/types';

async function getAd(id: string): Promise<Ad> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/ads/${id}`, { cache: 'no-store' });
  return res.json();
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const ad = await getAd(params.id);
  const mapUrl = `https://maps.google.com/maps?q=${ad.location.coordinates?.lat || 0},${ad.location.coordinates?.lng || 0}&z=13&output=embed`;
  return (
    <article className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        {ad.images.map((image) => (
          <div key={image} className="relative h-64"><Image src={image} alt={ad.title} fill className="object-cover rounded" /></div>
        ))}
      </div>
      <h1 className="text-2xl font-semibold">{ad.title}</h1>
      <p>{ad.description}</p>
      <p className="text-blue-700 font-semibold">₹{ad.price}/day</p>
      <div className="text-sm">Owner: {ad.user.name} {ad.user.phone || ad.user.email}</div>
      <iframe src={mapUrl} className="w-full h-56 rounded border" loading="lazy" />
      <button className="bg-black text-white px-4 py-2 rounded">Contact Owner</button>
    </article>
  );
}
