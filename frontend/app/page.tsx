"use client";

import { Suspense } from "react";
import HomeContent from "./home-content";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
