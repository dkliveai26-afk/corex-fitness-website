"use client";

import React, { useState } from "react";
import { 
  Users, 
  Dumbbell, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Activity, 
  Settings, 
  LogOut 
} from "lucide-react";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock Data for Dashboard
  const stats = [
    { label: "Total Members", value: "1,248", icon: Users, change: "+12% this month" },
    { label: "Active Trainers", value: "18", icon: Dumbbell, change: "All on duty" },
    { label: "Monthly Revenue", value: "₹4,52,000", icon: DollarSign, change: "+8% growth" },
    { label: "Gym Occupancy", value: "78%", icon: Activity, change: "Peak hours now" },
  ];

  const recentMembers = [
    { id: 1, name: "Rahul Sharma", plan: "Annual", status: "Paid", date: "Today" },
    { id: 2, name: "Amit Patel", plan: "Quarterly", status: "Paid", date: "Yesterday" },
    { id: 3, name: "Priya Rai", plan: "Monthly", status: "Pending", date: "14 Jun" },
    { id: 4, name: "Vikram Singh", plan: "Annual", status: "Paid", date: "13 Jun" },
  ];

  return (
    <div className="flex min-h-screen bg-[#070707] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-zinc-950 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xl font-black tracking-wider text-red-500">CORE X</span>
            <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold">ADMIN</span>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "members", label: "Manage Members", icon: Users },
              { id: "schedules", label: "Schedules", icon: Calendar },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <button className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight">DASHBOARD</h1>
            <p className="text-zinc-400 text-sm mt-1">Welcome back, Admin. Here is your gym's performance today.</p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-zinc-950 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400">{stat.label}</span>
                <stat.icon className="h-5 w-5 text-red-500" />
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black tracking-tight">{stat.value}</span>
                <span className="block text-xs text-zinc-500 mt-1">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Table */}
        <div className="rounded-2xl border border-white/5 bg-zinc-950 p-6">
          <h2 className="text-lg font-bold mb-4">Recent Member Registrations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="border-b border-white/5 text-xs uppercase text-zinc-500 font-bold">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-bold text-white">{member.name}</td>
                    <td className="py-4 px-4">{member.plan}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        member.status === "Paid" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-zinc-500">{member.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
