"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      await api.post("/auth/register", data);
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-3">
      <h1 className="text-xl font-semibold">Create account</h1>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <input className="border p-2 w-full" placeholder="Name" {...register("name", { required: true })} />
        <input className="border p-2 w-full" placeholder="Email" {...register("email", { required: true })} />
        <input className="border p-2 w-full" placeholder="Password" type="password" {...register("password", { required: true })} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Creating..." : "Register"}</button>
      </form>
    </div>
  );
}
