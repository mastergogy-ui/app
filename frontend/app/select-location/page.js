"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAppStore from "@/store/useAppStore";

export default function SelectLocation() {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const setLocation = useAppStore((s) => s.setLocation);
  const router = useRouter();

  const onSave = () => {
    setLocation({ city, state, pincode });
    localStorage.setItem("rentwala_location", JSON.stringify({ city, state, pincode }));
    router.push("/");
  };

  return (
    <div className="max-w-xl p-4 mx-auto space-y-3">
      <h2 className="text-xl font-semibold">Enter your location</h2>
      <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="border p-2 w-full" />
      <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="border p-2 w-full" />
      <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode" className="border p-2 w-full" />
      <button onClick={onSave} className="bg-green-600 text-white px-4 py-2 rounded">Save location</button>
    </div>
  );
}
