"use client";

import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";
import { api } from "../lib/api";

const categories = [
  "All",
  "Bike",
  "Car",
  "House",
  "Mobile",
  "Electronics",
  "Furniture",
  "Camera"
];

export default function HomePage() {

  const [ads,setAds] = useState<any[]>([]);
  const [filteredAds,setFilteredAds] = useState<any[]>([]);
  const [selectedCategory,setSelectedCategory] = useState("All");

  const fetchAds = async () => {

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

  const filterCategory = (cat:string)=>{

    setSelectedCategory(cat);

    if(cat === "All"){
      setFilteredAds(ads);
      return;
    }

    const filtered = ads.filter(
      (ad)=>ad.category === cat
    );

    setFilteredAds(filtered);
  };

  return(

    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-3xl font-bold mb-6">
        Latest Rentals
      </h1>

      <div className="flex flex-wrap gap-3 mb-6">

        {categories.map((cat)=>(
          <button
          key={cat}
          onClick={()=>filterCategory(cat)}
          className={`px-4 py-2 rounded-full border ${
            selectedCategory === cat
              ? "bg-blue-600 text-white"
              : "bg-white"
          }`}
          >
            {cat}
          </button>
        ))}

      </div>

      {filteredAds.length === 0 && (
        <p className="text-gray-500">
          No ads posted yet
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {filteredAds.map((ad,index)=>(

         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

  {filteredAds.map((ad,index)=>(
    <ListingCard key={index} ad={ad} />
  ))}

</div>

        ))}

      </div>

      {/* FLOAT POST BUTTON */}

      <a
      href="/post-ad"
      className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg"
      >
        + Post Ad
      </a>

    </div>

  );

}
