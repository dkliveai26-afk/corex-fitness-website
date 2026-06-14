"use client";

import { useState } from "react";

export function PlansPage() {
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
      name: name,
      phone: phone,
      plan: plan,
      date: new Date().toLocaleString(),
    };

    // Sync with Admin Dashboard LocalStorage
    const existingBookings = JSON.parse(localStorage.getItem("gym_bookings") || "[]");
    existingBookings.push(newBooking);
    localStorage.setItem("gym_bookings", JSON.stringify(existingBookings));

    // Sound Play Trigger
    const audio = new Audio("/success.mp3");
    audio.play().catch((err) => console.log("Audio layout error:", err));

    setMessage("🎉 Booking Confirmed Successfully!");
    setName("");
    setPhone("");
  };

  return (
    <div style={{ padding: "40px", maxWidth: "500px", margin: "40px auto", color: "#fff", background: "#111217", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#ef4444", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px" }}>Book Your Gym Plan</h2>
      {message && <p style={{ color: "#4ade80", textAlign: "center", fontWeight: "bold", marginTop: "15px" }}>{message}</p>}
      
      <form onSubmit={handleBooking} style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "12px", fontWeight: "bold", color: "#a1a1aa", textTransform: "uppercase" }}>Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.4)", color: "#fff", outline: "none" }} placeholder="Enter your name" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "12px", fontWeight: "bold", color: "#a1a1aa", textTransform: "uppercase" }}>Phone Number</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.4)", color: "#fff", outline: "none" }} placeholder="Enter phone number" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "12px", fontWeight: "bold", color: "#a1a1aa", textTransform: "uppercase" }}>Select Membership Plan</label>
          <select value={plan} onChange={(e) => setPlan(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.4)", color: "#fff", outline: "none" }}>
            <option value="Beginner Plan" style={{ background: "#111" }}>Beginner Plan - ₹999/mo</option>
            <option value="Standard Plan" style={{ background: "#111" }}>Standard Plan - ₹2,499/mo</option>
            <option value="Premium Plan" style={{ background: "#111" }}>Premium Plan - ₹7,999/yr</option>
          </select>
        </div>

        <button type="submit" style={{ padding: "14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "9999px", cursor: "pointer", fontWeight: "900", textTransform: "uppercase", trackingSpace: "1px", marginTop: "10px", boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)" }}>
          Confirm Booking
        </button>
      </form>
    </div>
  );
}
