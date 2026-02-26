"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "@/lib/api";

export default function PostAdPage() {
  const { register, handleSubmit, reset } = useForm();
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadImages = async (files) => {
    if (!files?.length) return [];
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));
    const response = await api.post("/ads/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.images;
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setMessage("");
      const imageUrls = await uploadImages(images);
      await api.post("/ads", {
        ...data,
        price: Number(data.price),
        images: imageUrls,
        location: { city: data.city, state: data.state },
      });
      reset();
      setImages([]);
      setMessage("Ad posted successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to post ad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-3">
      <h1 className="text-xl font-semibold">Post your ad</h1>
      <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
        <input className="border p-2" placeholder="Title" {...register("title", { required: true })} />
        <textarea className="border p-2" placeholder="Description" {...register("description", { required: true })} />
        <input className="border p-2" placeholder="Price" type="number" {...register("price", { required: true })} />
        <input className="border p-2" placeholder="Category" {...register("category", { required: true })} />
        <input className="border p-2" placeholder="Subcategory" {...register("subcategory")} />
        <input className="border p-2" placeholder="City" {...register("city", { required: true })} />
        <input className="border p-2" placeholder="State" {...register("state", { required: true })} />
        <input className="border p-2" type="file" multiple onChange={(e) => setImages(e.target.files)} />
        {message && <p className="text-sm text-slate-700">{message}</p>}
        <button className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
      </form>
    </div>
  );
}
