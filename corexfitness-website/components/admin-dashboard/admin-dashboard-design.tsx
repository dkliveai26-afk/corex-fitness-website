"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ContentManagementPanel } from "@/components/admin-dashboard/content-management";

interface BookingData {
  id: string;
  name: string;
  phone: string;
  plan: string;
  date: string;
}

const sidebarItems = ["Dashboard", "Bookings", "Content"] as const;
type AdminSection = (typeof sidebarItems)[number];

export function AdminDashboardDesign() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>("Dashboard");
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadBookings = () => {
      const data = localStorage.getItem("gym_bookings");
      if (data) {
        try {
          setBookings(JSON.parse(data));
        } catch (e) {
          console.error("Error parsing bookings data", e);
        }
      }
    };
    loadBookings();
    
    window.addEventListener("storage", loadBookings);
    return () => window.removeEventListener("storage", loadBookings);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this booking record?")) {
      const updatedBookings = bookings.filter((b) => b.id !== id);
      setBookings(updatedBookings);
      localStorage.setItem("gym_bookings", JSON.stringify(updatedBookings));
    }
  };

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return bookings;
    return bookings.filter((b) => 
      b.name.toLowerCase().includes(query) || 
      b.phone.toLowerCase().includes(query) ||
      b.plan.toLowerCase().includes(query)
    );
  }, [bookings, search]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070707] text-white">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-black/80 p-6 xl:block">
          <nav className="grid gap-2">
            {sidebarItems.map((item) => (
              <button
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-black uppercase tracking-wide transition ${
                  item === activeSection ? "border-red-500/60 bg-red-600/15 text-red-300" : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-red-400/60"
                }`}
                key={item}
                onClick={() => setActiveSection(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        {/* Core Layout Structure */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-black/75 backdrop-blur-xl">
            <div className="mx-auto flex min-h-16 w-[min(1200px,calc(100%-24px))] items-center justify-between gap-3 sm:min-h-20">
              <Link className="flex shrink-0 items-center" href="/">
                <img alt="CORE X FITNESS logo" className="h-12 w-44 object-contain object-left" src="/images/navbar-logo-fit.png" />
              </Link>

              <form action="/api/admin/logout" method="post" className="flex shrink-0 items-center">
                <button className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase transition hover:border-red-400" type="submit">
                  Logout
                </button>
              </form>
            </div>
          </header>

          {/* Conditional Rendering Pipeline */}
          <section className="mx-auto w-[min(1200px,calc(100%-24px))] pb-24 pt-6 sm:py-8">
            {activeSection === "Content" ? (
              <ContentManagementPanel />
            ) : (
              <div className="grid gap-6">
                {/* Stats Dashboard Panels */}
                <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                  <article className="rounded-2xl border border-white/10 bg-[#111217]/95 p-5">
                    <p className="text-xs font-black uppercase tracking-wide text-red-400">TOTAL BOOKINGS</p>
                    <h2 className="mt-2 text-2xl font-black">{bookings.length}</h2>
                    <p className="text-sm text-zinc-400">Complete conversion history</p>
                  </article>
                  <article className="rounded-2xl border border-white/10 bg-[#111217]/95 p-5">
                    <p className="text-xs font-black uppercase tracking-wide text-red-400">ACTIVE PLANS</p>
                    <h2 className="mt-2 text-2xl font-black">{bookings.length > 0 ? "Active" : "None"}</h2>
                    <p className="text-sm text-zinc-400">Valid system memberships</p>
                  </article>
                </section>

                {/* Primary Data Workspace Sheet */}
                <section className="rounded-2xl border border-white/10 bg-[#111217]/95 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-red-400">MEMBER WORKSPACE</p>
                      <h2 className="text-xl font-black sm:text-2xl">Real-time Bookings Data</h2>
                    </div>
                    <input 
                      className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-red-500 w-full sm:w-72" 
                      onChange={(e) => setSearch(e.target.value)} 
                      placeholder="Search by name or phone..." 
                      value={search} 
                    />
                  </div>

                  {/* Desktop Table View Layer */}
                  <div className="mt-5 hidden overflow-x-auto md:block">
                    <div className="min-w-[720px] rounded-2xl border border-white/10">
                      <div className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_0.8fr] gap-3 border-b border-white/10 bg-white/[0.04] p-4 text-xs font-black uppercase tracking-wide text-zinc-400">
                        <span>Name</span><span>Phone Number</span><span>Selected Plan</span><span>Booking Date</span><span>Actions</span>
                      </div>
                      {filteredBookings.length ? filteredBookings.map((b) => (
                        <div className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_0.8fr] gap-3 border-b border-white/10 p-4 text-sm items-center" key={b.id}>
                          <span className="font-black text-white">{b.name}</span>
                          <span className="text-zinc-300">{b.phone}</span>
                          <span className="text-red-400 font-bold">{b.plan}</span>
                          <span className="text-zinc-400 text-xs">{b.date}</span>
                          <button 
                            className="w-fit rounded-full border border-red-500/40 px-3 py-1 text-xs font-black text-red-200 transition hover:bg-red-600 hover:text-white" 
                            onClick={() => handleDelete(b.id)} 
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      )) : <p className="p-4 text-sm text-zinc-400">No matching sync data found.</p>}
                    </div>
                  </div>

                  {/* Responsive Mobile Layout Layer */}
                  <div className="mt-5 grid gap-3 md:hidden">
                    {filteredBookings.length ? filteredBookings.map((b) => (
                      <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={b.id}>
                        <div className="flex flex-col gap-1">
                          <p className="text-base font-black text-white">{b.name}</p>
                          <p className="text-sm text-zinc-400">{b.phone} | <span className="text-red-400 font-bold">{b.plan}</span></p>
                          <p className="text-xs text-zinc-500">{b.date}</p>
                          <button 
                            className="mt-2 w-full rounded-full border border-red-500/40 py-2 text-xs font-black text-red-200 bg-red-950/20 hover:bg-red-600 hover:text-white transition" 
                            onClick={() => handleDelete(b.id)} 
                            type="button"
                          >
                            Delete Record
                          </button>
                        </div>
                      </article>
                    )) : <p className="text-sm text-zinc-400">No matching sync data found.</p>}
                  </div>
                </section>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
