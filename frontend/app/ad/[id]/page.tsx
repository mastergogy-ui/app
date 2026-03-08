"use client";

import { useEffect,useState } from "react";
import { useParams,useRouter } from "next/navigation";
import { api } from "../../../lib/api";

export default function AdDetailsPage(){

const params = useParams();
const router = useRouter();

const id = params.id as string;

const [ad,setAd] = useState<any>(null);

useEffect(()=>{

```
const loadAd = async()=>{

  try{

    const res = await api.get(`/ads/${id}`);

    setAd(res.data);

  }catch(err){

    console.log(err);

  }

};

if(id){
  loadAd();
}
```

},[id]);

if(!ad){

```
return <div className="p-10">Loading...</div>;
```

}

const openChat = ()=>{

```
const token = localStorage.getItem("token");

if(!token){

  router.push("/login");
  return;

}

router.push(`/chat/${ad._id}`);
```

};

return(

```
<div className="max-w-4xl mx-auto p-6">

  {ad.image && (

    <img
      src={ad.image}
      className="w-full h-96 object-cover rounded-lg"
    />

  )}

  <h1 className="text-3xl font-bold mt-6">{ad.title}</h1>

  <p className="text-green-600 text-2xl font-bold mt-2">
    ₹ {ad.price}
  </p>

  <p className="text-gray-500 mt-2">
    📍 {ad.location}
  </p>

  <p className="mt-6 text-gray-700">
    {ad.description}
  </p>

  <button
    onClick={openChat}
    className="bg-blue-600 text-white px-6 py-3 rounded mt-6"
  >
    Chat with Seller
  </button>

</div>
```

);

}
