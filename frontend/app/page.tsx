"use client";

import { useEffect,useState } from "react";
import { api } from "../lib/api";
import ListingCard from "../components/ListingCard";
import { useSearchParams } from "next/navigation";

export default function HomePage(){

  const [ads,setAds] = useState<any[]>([]);
  const [filteredAds,setFilteredAds] = useState<any[]>([]);

  const searchParams = useSearchParams();

  const search = searchParams.get("search");

  const fetchAds = async()=>{

    try{

      const res = await api.get("/ads");

      const adsData =
        res.data.ads ||
        res.data.data ||
        res.data ||
        [];

      setAds(adsData);
      setFilteredAds(adsData);

    }catch(err){

      console.log("Fetch error",err);

    }

  };

  useEffect(()=>{

    fetchAds();

  },[]);

  useEffect(()=>{

    if(!search){

      setFilteredAds(ads);

      return;

    }

    const filtered = ads.filter((ad)=>

      ad.title
        .toLowerCase()
        .includes(search.toLowerCase())

    );

    setFilteredAds(filtered);

  },[search,ads]);

  return(

    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-3xl font-bold mb-6">
        Latest Rentals
      </h1>

      {filteredAds.length === 0 && (

        <p className="text-gray-500">
          No ads found
        </p>

      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {filteredAds.map((ad,index)=>(

          <ListingCard
            key={index}
            ad={ad}
          />

        ))}

      </div>

      {/* FLOAT BUTTON */}

      <a
        href="/post-ad"
        className="fixed bottom-6 right-6 bg-red-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg"
      >
        +
      </a>

    </div>

  );

}
