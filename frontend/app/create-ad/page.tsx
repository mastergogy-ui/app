"use client";

import { useEffect,useState } from "react";
import { api } from "../../lib/api";
import { useParams } from "next/navigation";

export default function AdPage(){

  const { id } = useParams();

  const [ad,setAd] = useState<any>(null);

  const fetchAd = async ()=>{

    const res = await api.get(`/ads/${id}`);

    setAd(res.data);

  };

  useEffect(()=>{
    fetchAd();
  },[]);

  if(!ad) return <p className="p-6">Loading...</p>;

  return(

    <div className="max-w-4xl mx-auto p-6">

      <img
      src={ad.image}
      className="w-full h-96 object-cover rounded-lg"
      />

      <h1 className="text-3xl font-bold mt-4">
        {ad.title}
      </h1>

      <p className="text-green-600 text-2xl mt-2">
        ₹ {ad.price}
      </p>

      <p className="mt-4">
        {ad.description}
      </p>

      <p className="mt-2 text-gray-500">
        📍 {ad.location}
      </p>

    </div>

  );

}
