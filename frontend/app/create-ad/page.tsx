"use client";

import {useState} from "react";

export default function CreateAd(){

const [title,setTitle]=useState("");
const [description,setDescription]=useState("");
const [price,setPrice]=useState("");
const [image,setImage]=useState(null);

const submitAd=async(e)=>{
e.preventDefault();

const formData=new FormData();

formData.append("title",title);
formData.append("description",description);
formData.append("price",price);
formData.append("image",image);

await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads`,{
method:"POST",
body:formData
});

alert("Ad posted!");
};

return(

<div className="p-10">

<h2 className="text-2xl mb-6">Post New Ad</h2>

<form onSubmit={submitAd} className="space-y-4">

<input
className="border p-2 w-full"
placeholder="Title"
onChange={(e)=>setTitle(e.target.value)}
/>

<textarea
className="border p-2 w-full"
placeholder="Description"
onChange={(e)=>setDescription(e.target.value)}
/>

<input
className="border p-2 w-full"
placeholder="Price"
onChange={(e)=>setPrice(e.target.value)}
/>

<input
type="file"
onChange={(e)=>setImage(e.target.files[0])}
/>

<button
className="bg-black text-white px-6 py-2"
type="submit"
>
Post Ad
</button>

</form>

</div>

);
}

