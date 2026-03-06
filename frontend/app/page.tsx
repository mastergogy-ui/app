'use client'

import { useEffect, useState } from "react"
import Link from "next/link"

const categories = [
{ name: "Cars", icon: "🚗" },
{ name: "Properties", icon: "🏠" },
{ name: "Mobiles", icon: "📱" },
{ name: "Fashion", icon: "👕" },
{ name: "Bikes", icon: "🏍️" },
{ name: "Electronics", icon: "💻" },
{ name: "Commercial Vehicles", icon: "🚚" },
{ name: "Furniture", icon: "🛋️" },
{ name: "Rent a Friend", icon: "🤝" },
]

export default function HomePage(){

const [ads,setAds] = useState([])

useEffect(()=>{
fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings`)
.then(res=>res.json())
.then(data=>setAds(data))
},[])

return (

<div className="space-y-6">

<div className="flex gap-4 overflow-x-auto pb-2">
{categories.map((cat)=>(
<div key={cat.name} className="min-w-[90px] flex flex-col items-center bg-slate-800 p-4 rounded-lg">
<span className="text-3xl">{cat.icon}</span>
<p className="text-sm mt-2">{cat.name}</p>
</div>
))}
</div>

<h2 className="text-xl font-semibold">Fresh Rentals</h2>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

{ads.map((ad:any)=>(
<div key={ad._id} className="bg-slate-800 p-3 rounded">

<h3 className="font-semibold">{ad.title}</h3>

<p className="text-green-400">₹ {ad.price}</p>

<p className="text-sm text-slate-400">{ad.location}</p>

</div>
))}

</div>

<Link href="/post-ad">
<button className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 px-6 py-3 rounded-full text-white shadow-lg">
+ RENT
</button>
</Link>

</div>

)

}
