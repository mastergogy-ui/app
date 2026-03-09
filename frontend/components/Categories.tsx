"use client";

export default function Categories(){

const cats = [
"Mobiles",
"Cars",
"Bikes",
"Properties",
"Electronics",
"Furniture",
"Jobs",
"Fashion"
];

return(

<div className="grid grid-cols-4 gap-4 mb-10">

{cats.map((c,i)=>(

<div
key={i}
className="border p-6 rounded text-center hover:bg-gray-100 cursor-pointer"
>

{c}

</div>

))}

</div>

);

}
