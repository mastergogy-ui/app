"use client";

import { useEffect,useState } from "react";
import { api } from "../../lib/api";
import { getToken } from "../../lib/auth";
import { useRouter } from "next/navigation";

export default function PostAdPage(){

  const router = useRouter();

  const [title,setTitle] = useState("");
  const [description,setDescription] = useState("");
  const [price,setPrice] = useState("");
  const [category,setCategory] = useState("");
  const [image,setImage] = useState<any>(null);
  const [preview,setPreview] = useState("");

  useEffect(()=>{

    const token = getToken();

    if(!token){

      router.push("/login");

    }

  },[]);

  const handleSubmit = async(e:any)=>{

    e.preventDefault();

    try{

      const formData = new FormData();

      formData.append("title",title);
      formData.append("description",description);
      formData.append("price",price);
      formData.append("category",category);

      if(image){

        formData.append("image",image);

      }

      await api.post("/ads",formData);

      router.push("/");

    }catch(err){

      console.log(err);

    }

  };

  return(

    <div className="max-w-xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">

        Post New Ad

      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <input
          placeholder="Title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="w-full border p-2"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          className="w-full border p-2"
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e)=>setPrice(e.target.value)}
          className="w-full border p-2"
        />

        <input
          placeholder="Category"
          value={category}
          onChange={(e)=>setCategory(e.target.value)}
          className="w-full border p-2"
        />

        <input
          type="file"
          onChange={(e)=>{

            const file = e.target.files?.[0];

            if(file){

              setImage(file);
              setPreview(URL.createObjectURL(file));

            }

          }}
        />

        {preview && (

          <img
            src={preview}
            className="w-40"
          />

        )}

        <button
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Post Ad
        </button>

      </form>

    </div>

  );

}
