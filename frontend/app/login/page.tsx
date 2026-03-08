"use client";

import { useState } from "react";
import { api } from "../../lib/api";
import { setToken } from "../../lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage(){

  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async(e:any)=>{

    e.preventDefault();

    try{

      const res = await api.post("/auth/login",{

        email,
        password

      });

      setToken(res.data.token);

      router.push("/post-ad");

    }catch(err){

      alert("Login failed");

    }

  };

  return(

    <div className="max-w-md mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">

        Login

      </h1>

      <form
        onSubmit={handleLogin}
        className="space-y-4"
      >

        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full border p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full border p-2"
        />

        <button
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Login
        </button>

      </form>

    </div>

  );

}
