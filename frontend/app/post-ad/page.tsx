"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function PostAdPage() {

  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [title,setTitle] = useState("");
  const [description,setDescription] = useState("");

  useEffect(()=>{

    if(!loading && !user){
      router.push("/");
    }

  },[user,loading,router]);

  const submitAd = async(e:any)=>{

    e.preventDefault();

    try{

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ads`,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${token}`
          },
          body:JSON.stringify({
            title,
            description
          })
        }
      );

      if(res.ok){
        router.push("/dashboard");
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
