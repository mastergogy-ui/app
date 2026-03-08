"use client";

import { useState } from "react";

export default function PostAdPage() {

const [title,setTitle] = useState("");
const [category,setCategory] = useState("Bike");
const [price,setPrice] = useState("");
const [location,setLocation] = useState("");
const [description,setDescription] = useState("");
const [image,setImage] = useState<File | null>(null);

const submitAd = async (e:any)=>{
e.preventDefault();

const formData = new FormData();

formData.append("title",title);
formData.append("category",category);
formData.append("price",price);
formData.append("location",location);
formData.append("description",description);

if(image){
formData.append("image",image);
}

await fetch(
process.env.NEXT_PUBLIC_API_URL + "/api/ads",
{
method:"POST",
body:formData
}
);

alert("Ad Posted");

};

return(

<div className="min-h-screen flex justify-center items-center bg-gray-100">

<form
onSubmit={submitAd}
className="bg-white p-8 rounded-lg shadow w-[420px]"
>

<h1 className="text-2xl font-bold mb-6">
Post Your Rental Ad
</h1>

<input
placeholder="Title"
className="border p-2 w-full mb-4"
onChange={(e)=>setTitle(e.target.value)}
required
/>

<select
className="border p-2 w-full mb-4"
onChange={(e)=>setCategory(e.target.value)}
>

<option>Bike</option>
<option>Car</option>
<option>House</option>
<option>Mobile</option>
<option>Electronics</option>
<option>Furniture</option>
<option>Camera</option>

</select>

<input
placeholder="Price"
type="number"
className="border p-2 w-full mb-4"
onChange={(e)=>setPrice(e.target.value)}
required
/>

<input
placeholder="Location"
className="border p-2 w-full mb-4"
onChange={(e)=>setLocation(e.target.value)}
required
/>

<textarea
placeholder="Description"
className="border p-2 w-full mb-4"
onChange={(e)=>setDescription(e.target.value)}
required
/>

<input
type="file"
className="border p-2 w-full mb-4"
onChange={(e)=>setImage(e.target.files?.[0] || null)}
/>

<button
className="bg-blue-600 text-white w-full p-3 rounded"
>

Post Ad

</button>

</form>

</div>

);

}
