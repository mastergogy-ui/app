"use client";

import { useState } from "react";
import axios from "axios";

export default function PostAdPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Rent a Bike");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [country, setCountry] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("city", city);
      formData.append("area", area);
      formData.append("country", country);

      if (image) {
        formData.append("image", image);
      }

      const res = await axios.post(
        "https://mahalakshmi.onrender.com/api/ads",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Ad posted successfully");
      console.log(res.data);
    } catch (err) {
      console.error("POST ERROR", err);
      alert("Failed to post ad");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Create Listing</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          className="w-full border p-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border p-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="w-full border p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Rent a Bike</option>
          <option>Rent a Car</option>
          <option>Property</option>
        </select>

        <input
          className="w-full border p-2"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <div className="flex gap-2">
          <input
            className="border p-2 flex-1"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <input
            className="border p-2 flex-1"
            placeholder="Area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />

          <input
            className="border p-2 flex-1"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>

        <input
          type="file"
          onChange={(e) =>
            setImage(e.target.files ? e.target.files[0] : null)
          }
        />

        <button className="w-full bg-black text-white py-2 rounded">
          Post Ad
        </button>
      </form>
    </div>
  );
}
