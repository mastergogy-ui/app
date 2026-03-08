"use client";

import Link from "next/link";

export default function ListingCard({ ad }: any) {

  return (

    <Link href={`/ad/${ad._id}`}>

      <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden cursor-pointer">

        {/* IMAGE */}

        <div className="h-48 bg-gray-200 flex items-center justify-center">

          {ad.image ? (

            <img
              src={ad.image}
              alt={ad.title}
              className="h-full w-full object-cover"
            />

          ) : (

            <span className="text-gray-400">
              No Image
            </span>

          )}

        </div>

        {/* CONTENT */}

        <div className="p-4">

          <h2 className="text-lg font-semibold line-clamp-1">
            {ad.title}
          </h2>

          <p className="text-green-600 font-bold text-lg mt-1">
            ₹ {ad.price}
          </p>

          <p className="text-gray-500 text-sm">
            {ad.category}
          </p>

          <p className="text-gray-400 text-xs mt-2">
            📍 {ad.location}
          </p>

        </div>

      </div>

    </Link>

  );

}
