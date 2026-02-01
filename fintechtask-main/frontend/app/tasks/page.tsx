"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetcher(url:string) {
  const token = sessionStorage.getItem("accessToken");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" });
  if (res.status === 401) {
    // attempt refresh
    const r2 = await fetch(API + "/auth/refresh", { method: "POST", credentials: "include" });
    if (r2.ok) {
      const { accessToken } = await r2.json();
      sessionStorage.setItem("accessToken", accessToken);
      return fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, credentials: "include" }).then(r => r.json());
    }
    throw new Error("Not authorized");
  }
  return res.json();
}

export default function TasksPage(){
  const [query,setQuery] = useState("");
  const [title,setTitle] = useState("");
  const { data, mutate } = useSWR(() => `${API}/tasks?search=${encodeURIComponent(query)}&take=20`, fetcher);

  async function addTask(e:any){
    e.preventDefault();
    const token = sessionStorage.getItem("accessToken");
    const r = await fetch(`${API}/tasks`, { method: "POST", headers: { "content-type":"application/json", Authorization:`Bearer ${token}` }, credentials:"include", body: JSON.stringify({ title })});
    if (!r.ok) {
      const err = await r.json().catch(()=>({error:"Add failed"}));
      return alert(err.error || "Add failed");
    }
    setTitle("");
    mutate();
  }

  async function toggle(id:number){
    const token = sessionStorage.getItem("accessToken");
    await fetch(`${API}/tasks/${id}/toggle`, { method: "POST", headers: { Authorization:`Bearer ${token}` }, credentials:"include" });
    mutate();
  }

  return (
    <div>
      <h1>Tasks</h1>
      <form onSubmit={addTask}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="New task title" />
        <button>Add</button>
      </form>

      <div style={{ marginTop: 12 }}>
        <input placeholder="Search..." value={query} onChange={e=>setQuery(e.target.value)} />
        <button onClick={()=>mutate()}>Search</button>
      </div>

      <ul>
        {data && data.data.map((t:any) => (
          <li key={t.id}>
            <b>{t.title}</b> — {t.status} — <button onClick={()=>toggle(t.id)}>Toggle</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
