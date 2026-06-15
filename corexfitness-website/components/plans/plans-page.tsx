"use client";

import { useState } from "react";

interface Plan {
  name: string;
  price: string;
  duration: string;
  features: string[];
  color: string;
}

const plans: Plan[] = [
  {
    name: "Monthly",
    price: "₹1,500",
    duration: "Per Month",
    color: "from-zinc-900 to-zinc-800",
    features: [
      "Access to gym floor",
      "Standard equipment",
      "Locker room access",
      "Free WiFi",
    ],
  },
  {
    name: "Quarterly",
    price: "₹4,000",
    duration: "3 Months",
    color: "from-red-950/40 to-red-900/20 border-red-500/30",
    features: [
      "Everything in Monthly",
      "1 Personal training session",
      "Diet consultation",
      "Body composition analysis",
    ],
  },
  {
    name: "Annual",
    price: "₹12,000",
    duration: "12 Months",
    color: "from-zinc-900 to-zinc-800",
    features: [
      "Everything in Quarterly",
      "Unrestricted access",
      "Free gym merchandise",
      "Priority support",
    ],
  },
];

export function PlansPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = (planName: string) => {
    setLoading(planName);
    setTimeout(() => {
      const existingBookings = JSON.parse(localStorage.getItem("gym_bookings") || "[]");
      const newBooking = {
        id: Math.random().toString(36).substr(2, 9),
        name: "Regular Gym Member",
        phone: "9999999999",
        plan: planName,
        date: new Date().toLocaleDateString(),
      };
      localStorage.setItem("gym_bookings", JSON.stringify([...existingBookings, newBooking]));
      
      const audio = new Audio("/success.mp3");
      audio.play().catch(() => {});
      
      alert(`Successfully booked ${planName} plan!`);
      setLoading(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#070707] py-20 text-white">
      <div className="mx-auto w-[min(1200px,calc(100%-48px))]">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest text-red-500">Membership</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">CHOOSE YOUR PLAN</h1>
          <p className="mt-4 text-zinc-400">Select the perfect membership structure for your fitness journey.</p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border border-white/10 bg-gradient-to-b p-8 shadow-2xl ${plan.color}`}
            >
              <h3 className="text-xl font-black uppercase tracking-wide">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                <span className="text-sm text-zinc-400">/ {plan.duration}</span>
              </div>

              <ul className="mt-8 grid gap-4 border-t border-white/5 pt-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                    <span className="h-4 w-4 shrink-0 text-red-500 font-bold">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.name)}
                disabled={loading !== null}
                className="mt-8 w-full rounded-2xl bg-white py-4 text-center text-sm font-black uppercase tracking-wider text-black transition hover:bg-red-500 hover:text-white disabled:opacity-50"
              >
                {loading === plan.name ? "Processing..." : "Select Plan"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
