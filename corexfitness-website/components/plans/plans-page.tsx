"use client";

import { useState, useEffect } from "react";

export function PlansPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("Monthly");
  const [message, setMessage] = useState("");

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone) {
      alert("Please fill all fields");
      return;
    }

    // 1. Create Booking Object
    const newBooking = {
      id: Date.now().toString(),
      name,
      phone,
      plan,
      date: new Date().toLocaleString(),
    };

    // 2. Save Data to LocalStorage (Universal Key for Admin Panel)
    const existingBookings = JSON.parse(localStorage.getItem("gym_bookings") || "[]");
    existingBookings.push(newBooking);
    localStorage.setItem("gym_bookings", JSON.stringify(existingBookings));

    // 3. Play Your Custom success.mp3 Sound
    const audio = new Audio("/success.mp3");
    audio.play().catch((err) => console.log("Audio play error:", err));

    // 4. Success Message & Reset Form
    setMessage("🎉 Booking Confirmed! Thank you.");
    setName("");
    phone("");
  };

  return (
    <div style={{ padding: "40px", maxWidth: "500px", margin: "0 auto", color: "#fff", background: "#111", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center", color: "#ff3e3e" }}>BOOK YOUR GYM PLAN</h2>
      
      {message && <p style={{ color: "#4caf50", textAlign: "center", fontWeight: "bold" }}>{message}</p>}
      
      <form onSubmit={handleBooking} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
        <label>Full Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "10px", borderRadius: "4px", border: "1px solid #333", background: "#222", color: "#fff" }} placeholder="Enter your name" />

        <label>Phone Number:</label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: "10px", borderRadius: "4px", border: "1px solid #333", background: "#222", color: "#fff" }} placeholder="Enter phone number" />

        <label>Select Plan:</label>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} style={{ padding: "10px", borderRadius: "4px", border: "1px solid #333", background: "#222", color: "#fff" }}>
          <option value="Monthly">Monthly Plan - ₹999</option>
          <option value="Quarterly">Quarterly Plan - ₹2499</option>
          <option value="Yearly">Yearly Plan - ₹7999</option>
        </select>

        <button type="submit" style={{ padding: "12px", background: "#ff3e3e", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" }}>
          Confirm Booking
        </button>
      </form>
    </div>
  );
}
