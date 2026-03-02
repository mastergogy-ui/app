import Image from 'next/image';
import Link from 'next/link';
import { Ad } from '@/types';

export default function ListingCard({ ad }: { ad: Ad }) {
  return (
    <Link href={`/listings/${ad._id}`} className="bg-white rounded-lg border overflow-hidden hover:shadow-sm">
      <div className="relative h-48">
        <Image src={ad.images?.[0] || '/placeholder.svg'} alt={ad.title} fill className="object-cover" loading="lazy" />
      </div>
      <div className="p-4 space-y-1">
        <h3 className="font-semibold">{ad.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{ad.description}</p>
        <p className="text-blue-700 font-medium">₹{ad.price}/day</p>
      </div>
    </Link>
  );
}
