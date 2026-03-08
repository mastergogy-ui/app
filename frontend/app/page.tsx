"use client";

import Categories from "../components/Categories";
import FloatingPostAd from "../components/FloatingPostAd";

export default function HomePage(){

  return(

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        RentWala Marketplace
      </h1>

      <Categories/>

      <FloatingPostAd/>

    </div>

  );

}
