"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function PostAdPage() {

  const router = useRouter();
  const { token, loading } = useAuth();

  const [title,setTitle] = useState("");
  const [description,setDescription] = useState("");
  const [price,setPrice] = useState("");
  const [location,setLocation] = useState("");
  const [image,setImage] = useState<File | null>(null);

  useEffect(()=>{

    /* check login using token instead of user */

    if(!loading && !token){
      router.push("/");
    }

  },[token,loading,router]);



  const submitAd = async(e:any)=>{

    e.preventDefault();

    try{

      const formData = new FormData();

      formData.append("title",title);
      formData.append("description",description);
      formData.append("price",price);
      formData.append("location",location);

      if(image){
        formData.append("image",image);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ads`,
        {
          method:"POST",
          body:formData
        }
      );

      if(res.ok){
        router.push("/");
      }else{
        alert("Failed to create ad");
      }

    }catch(err){

      console.log(err);
      alert("Failed to create ad");

    }

  };



  return(

    <div className="max-w-xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Post New Ad
      </h1>

      <form onSubmit={submitAd} className="space-y-4">

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="w-full border p-3 rounded"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          className="w-full border p-3 rounded"
          rows={4}
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e)=>setPrice(e.target.value)}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e)=>setLocation(e.target.value)}
          className="w-full border p-3 rounded"
        />

        <input
          type="file"
          onChange={(e)=>setImage(e.target.files?.[0] || null)}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Post Ad
        </button>

      </form>

    </div>
  );
}
