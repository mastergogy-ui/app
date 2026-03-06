'use client'

import { useState } from "react"

export default function HomePage() {

  const [location, setLocation] = useState("Select Location")

  const categories = [
    { name: "Cars", icon: "🚗" },
    { name: "Bikes", icon: "🏍️" },
    { name: "Mobiles", icon: "📱" },
    { name: "Electronics", icon: "💻" },
    { name: "Furniture", icon: "🛋️" }
  ]

  const listings = [
    {
      id: 1,
      title: "Honda City 2022",
      price: "₹2000 / day",
      location: "Pune",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70"
    },
    {
      id: 2,
      title: "iPhone 13 Pro",
      price: "₹500 / day",
      location: "Mumbai",
      image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5"
    },
    {
      id: 3,
      title: "Royal Enfield Classic",
      price: "₹800 / day",
      location: "Delhi",
      image: "https://images.unsplash.com/photo-1558980664-10e7170c2e2c"
    },
    {
      id: 4,
      title: "Gaming Laptop",
      price: "₹700 / day",
      location: "Bangalore",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}

      <div className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-600">
          Rent Wala
        </h1>

        <select
          className="border p-2 rounded"
          value={location}
          onChange={(e)=>setLocation(e.target.value)}
        >
          <option>Select Location</option>
          <option>Pune</option>
          <option>Mumbai</option>
          <option>Delhi</option>
          <option>Bangalore</option>
        </select>
      </div>


      {/* Categories */}

      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Categories
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

          {categories.map((cat)=>(
            <div
              key={cat.name}
              className="bg-white rounded-lg shadow p-6 text-center cursor-pointer hover:shadow-lg"
            >
              <div className="text-3xl">
                {cat.icon}
              </div>

              <div className="mt-2 font-medium">
                {cat.name}
              </div>
            </div>
          ))}

        </div>
      </div>


      {/* Listings */}

      <div className="p-6">

        <h2 className="text-xl font-semibold mb-4">
          Latest Listings
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          {listings.map((item)=>(
            <div
              key={item.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >

              <img
                src={item.image}
                className="h-40 w-full object-cover"
              />

              <div className="p-4">

                <h3 className="font-semibold">
                  {item.title}
                </h3>

                <p className="text-green-600 font-bold">
                  {item.price}
                </p>

                <p className="text-gray-500 text-sm">
                  {item.location}
                </p>

                <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  Rent Now
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  )
}
