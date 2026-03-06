'use client'

import { useState } from "react";

export default function PostAdPage() {

const [title,setTitle] = useState("")
const [price,setPrice] = useState("")
const [category,setCategory] = useState("Cars")
const [location,setLocation] = useState("")
const [description,setDescription] = useState("")

const handleSubmit = (e:any)=>{
e.preventDefault()

alert("Ad posted (demo)")
}

return (
<div className="max-w-xl mx-auto bg-slate-900 p-6 rounded-lg">

<h1 className="text-2xl font-bold mb-6">Post Your Rental Ad</h1>

<form onSubmit={handleSubmit} className="space-y-4">

<input
className="w-full p-3 rounded bg-slate-800"
placeholder="Title"
value={title}
onChange={(e)=>setTitle(e.target.value)}
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
/>

<input
className="w-full p-3 rounded bg-slate-800"
placeholder="Location"
value={location}
onChange={(e)=>setLocation(e.target.value)}
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
>
POST RENTAL
</button>

</form>

</div>
)

}
