"use client";
import { useState } from "react";

export default function Login() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  async function submit(e:any){
    e.preventDefault();
    const resp = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!resp.ok) {
      const err = await resp.json().catch(()=>({error:"Login failed"}));
      return alert(err.error || "Login failed");
    }
    const { accessToken } = await resp.json();
    sessionStorage.setItem("accessToken", accessToken);
    window.location.href = "/tasks";
  }
  return (
    <form onSubmit={submit}>
      <h1>Login</h1>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" />
      <button type="submit">Login</button>
      <div><a href="/register">Register</a></div>
    </form>
  );
}
