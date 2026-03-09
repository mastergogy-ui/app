"use client"

import Link from "next/link"

export default function FloatingPostAd(){

return(

<Link
href="/create-ad"
className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg"
>

+ Post Ad

</Link>

)

}
