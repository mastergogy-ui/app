"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import api from "@/lib/api";
import useAppStore from "@/store/useAppStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAppStore((s) => s.setAuth);
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      const response = await api.post("/auth/login", data);
      setAuth(response.data);
      router.push("/select-location");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-3">
      <h1 className="text-xl font-semibold">Login</h1>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <input className="border p-2 w-full" placeholder="Email" {...register("email", { required: true })} />
        <input className="border p-2 w-full" placeholder="Password" type="password" {...register("password", { required: true })} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
      <button onClick={() => signIn("google")} className="border px-4 py-2 rounded w-full">Continue with Google</button>
    </div>
  );
}
