import ListingCard from '@/components/ListingCard';
import { api } from '@/lib/api';
import { Ad } from '@/types';

async function getAds(searchParams: { [key: string]: string | string[] | undefined }) {
  const query = new URLSearchParams();
  if (searchParams.category) query.append('category', String(searchParams.category));
  if (searchParams.location) query.append('location', String(searchParams.location));
  if (searchParams.q) query.append('q', String(searchParams.q));
  query.append('page', String(searchParams.page || 1));
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/ads?${query.toString()}`, { next: { revalidate: 60 } });
  return res.json();
}

export default async function Home({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const data = await getAds(searchParams);
  return (
    <section className="space-y-4">
      <form className="grid md:grid-cols-4 gap-2" method="GET">
        <input name="q" placeholder="Search listings" className="border px-3 py-2 rounded" />
        <input name="location" placeholder="Location" className="border px-3 py-2 rounded" />
        <select name="category" className="border px-3 py-2 rounded">
          <option value="">All Categories</option>
          <option>Rent a Friend</option>
          <option>Rent a Bike</option>
          <option>Rent a Car</option>
          <option>Rent a Property</option>
        </select>
        <button className="bg-black text-white rounded px-4">Apply</button>
      </form>
      <div className="grid md:grid-cols-3 gap-4">
        {(data.ads as Ad[]).map((ad) => <ListingCard key={ad._id} ad={ad} />)}
      </div>
    </section>
  );
}
