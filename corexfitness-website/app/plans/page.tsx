"use client";

import { useState } from "react";
import Link from "next/link";

export default function PlansPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("Standard Plan");
  const [message, setMessage] = useState("");

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("Please fill all fields");
      return;
    }

    const newBooking = {
      id: Date.now().toString(),
      name,
      phone,
      plan,
      date: new Date().toLocaleString(),
    };

    // Master Key Sync with Dashboard
    const existingBookings = JSON.parse(localStorage.getItem("gym_bookings") || "[]");
    existingBookings.push(newBooking);
    localStorage.setItem("gym_bookings", JSON.stringify(existingBookings));

    // Audio Play Trigger
    const audio = new Audio("/success.mp3");
    audio.play().catch((err) => console.log("Audio play blocked/error:", err));

    setMessage("🎉 Booking Confirmed Successfully!");
    setName("");
    setPhone("");
  };

  return (
    <main className="min-h-screen bg-[#070707] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111217]/95 p-6 shadow-xl">
        <h2 className="text-center text-2xl font-black tracking-wide text-red-500 uppercase">Book Your Gym Plan</h2>
        {message && <p className="mt-4 text-center text-sm font-bold text-green-400">{message}</p>}
        
        <form onSubmit={handleBooking} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-zinc-400">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-red-500" placeholder="Enter full name" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-zinc-400">Phone Number</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-red-500" placeholder="Enter phone number" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-zinc-400">Select Membership Plan</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-red-500">
              <option value="Beginner Plan">Beginner Plan - ₹999/mo</option>
              <option value="Standard Plan">Standard Plan - ₹2,499/mo</option>
              <option value="Premium Plan">Premium Plan - ₹7,999/yr</option>
            </select>
          </div>
          <button type="submit" className="mt-2 w-full rounded-full bg-red-600 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg transition hover:bg-red-500">
            Confirm Booking
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-zinc-500 hover:text-red-400 transition">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
