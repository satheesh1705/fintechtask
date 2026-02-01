"use client";
import { useState } from "react";

export default function Register(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  async function submit(e:any){
    e.preventDefault();
    const resp = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!resp.ok) {
      const err = await resp.json().catch(()=>({error:"Register failed"}));
      return alert(err.error || "Register failed");
    }
    alert("Registered. Please login.");
    window.location.href = "/";
  }
  return (
    <form onSubmit={submit}>
      <h1>Register</h1>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" />
      <button type="submit">Register</button>
    </form>
  );
}
