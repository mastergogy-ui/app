'use client'

import { useState } from "react";

export default function PostAdPage(){

const [title,setTitle] = useState("")
const [price,setPrice] = useState("")
const [category,setCategory] = useState("Cars")
const [location,setLocation] = useState("")
const [description,setDescription] = useState("")
const [loading,setLoading] = useState(false)

const API = process.env.NEXT_PUBLIC_API_URL

const handleSubmit = async (e:any)=>{
e.preventDefault()

if(!title || !price || !location){
alert("Please fill all fields")
return
}

try{

setLoading(true)

const res = await fetch(`${API}/api/ads`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
title,
price,
category,
location,
description
})
})

if(!res.ok){
throw new Error("Failed")
}

await res.json()

alert("Ad posted successfully")

setTitle("")
setPrice("")
setLocation("")
setDescription("")

}catch(err){
console.error(err)
alert("Error posting ad")
}

setLoading(false)
}

return(

<div className="max-w-xl mx-auto bg-slate-900 p-6 rounded-lg text-white">

<h1 className="text-2xl font-bold mb-6">
Post Your Rental Ad
</h1>

<form onSubmit={handleSubmit} className="space-y-4">

<input
className="w-full p-3 rounded bg-slate-800"
placeholder="Title"
value={title}
onChange={(e)=>setTitle(e.target.value)}
required
/>

<select
className="w-full p-3 rounded bg-slate-800"
value={category}
onChange={(e)=>setCategory(e.target.value)}
>
<option>Cars</option>
<option>Properties</option>
<option>Mobiles</option>
<option>Fashion</option>
<option>Bikes</option>
<option>Electronics</option>
<option>Commercial Vehicles</option>
<option>Furniture</option>
<option>Rent a Friend</option>
</select>

<input
className="w-full p-3 rounded bg-slate-800"
placeholder="Price per day"
value={price}
onChange={(e)=>setPrice(e.target.value)}
required
/>

<input
className="w-full p-3 rounded bg-slate-800"
placeholder="Location"
value={location}
onChange={(e)=>setLocation(e.target.value)}
required
/>

<textarea
className="w-full p-3 rounded bg-slate-800"
placeholder="Description"
value={description}
onChange={(e)=>setDescription(e.target.value)}
/>

<button
className="w-full bg-blue-600 p-3 rounded font-semibold"
type="submit"
disabled={loading}
>
{loading ? "Posting..." : "POST RENTAL"}
</button>

</form>

</div>

)
}
