"use client";

import { useState } from "react";
import { saveMember } from "@/lib/gym-management-store";
import { today, addMonths } from "@/lib/gym-management-store";
import { getPlanPrice } from "@/lib/gym-management-store";

export function PlansPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("Beginner Plan");
  const [message, setMessage] = useState("");

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("Please fill all fields");
      return;
    }

    const startDate = today();
    
    // Original system helper function to store data perfectly
    saveMember({
      fullName: name,
      phoneNumber: phone,
      email: `${name.toLowerCase().replace(/\s+/g, "")}@corex.com`,
      selectedPlan: plan,
      membershipStartDate: startDate,
      membershipEndDate: addMonths(startDate, 1),
      paymentStatus: "pending",
      feesAmount: getPlanPrice(plan),
      notes: "Online Booking Submission"
    });

    // Sound Trigger Loop
    try {
      const audio = new Audio("/success.mp3");
      audio.play();
    } catch (err) {
      console.log("Audio target error:", err);
    }

    setMessage("🎉 Booking Registered! Check Dashboard.");
    setName("");
    setPhone("");
  };

  return (
    <div style={{ padding: "40px", maxWidth: "500px", margin: "40px auto", color: "#fff", background: "#111217", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
      <h2 style={{ textAlign: "center", color: "#ef4444", fontWeight: "900", textTransform: "uppercase" }}>Book Your Gym Plan</h2>
      {message && <p style={{ color: "#4ade80", textAlign: "center", fontWeight: "bold" }}>{message}</p>}
      <form onSubmit={handleBooking} style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "12px", borderRadius: "8px", background: "#000", color: "#fff", border: "1px solid #333" }} placeholder="Full Name" />
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: "12px", borderRadius: "8px", background: "#000", color: "#fff", border: "1px solid #333" }} placeholder="Phone Number" />
        <select value={plan} onChange={(e) => setPlan(e.target.value)} style={{ padding: "12px", borderRadius: "8px", background: "#000", color: "#fff", border: "1px solid #333" }}>
          <option value="Beginner Plan">Beginner Plan</option>
          <option value="Standard Plan">Standard Plan</option>
          <option value="Premium Plan">Premium Plan</option>
        </select>
        <button type="submit" style={{ padding: "14px", background: "#dc2626", color: "#fff", borderRadius: "9999px", fontWeight: "900", cursor: "pointer" }}>Confirm Booking</button>
      </form>
    </div>
  );
}
