"use client";

import { useSearchParams } from "next/navigation";

export default function HomeContent() {

  const searchParams = useSearchParams();
  const q = searchParams.get("q");

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        Mahalakshmi Marketplace
      </h1>

      {q && (
        <p className="text-gray-500">
          Search: {q}
        </p>
      )}

    </div>
  );
}
