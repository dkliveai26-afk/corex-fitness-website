"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { emptyGymDataStore, type GymDataStore, type MemberData } from "@/lib/gym-data-models";
import {
  formatGymDate,
  getRemainingDays,
  loadGymDataStore,
  saveMember,
  subscribeGymDataStore,
  syncGymDataStoreFromServer
} from "@/lib/gym-management-store";

const navItems = ["Overview", "Membership", "Bookings", "Activity", "Profile"];
const profileImage = "/images/gym/trainer-male.svg";

export function UserDashboardPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [store, setStore] = useState<GymDataStore>(emptyGymDataStore);

  useEffect(() => {
    setStore(loadGymDataStore());
    void syncGymDataStoreFromServer().then(setStore);
    return subscribeGymDataStore(() => setStore(loadGymDataStore()));
  }, []);

  const member = store.members[0];
  const remainingDays = member ? getRemainingDays(member.membershipEndDate) : 0;
  const progress = Math.max(8, Math.min(100, Math.round((remainingDays / 180) * 100)));
  const memberBookings = store.bookings.filter((booking) => !member || booking.userName === member.fullName);
  const activity = useMemo(() => buildActivity(store, member), [store, member]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070707] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-black/80 p-6 xl:block">
          <DashboardBrand />
          <DashboardNav />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-black/75 backdrop-blur-xl">
            <div className="mx-auto flex min-h-20 w-[min(1180px,calc(100%-24px))] items-center justify-between gap-4">
              <button
                aria-label="Open dashboard menu"
                className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white transition hover:border-red-400 xl:hidden"
                onClick={() => setIsMenuOpen(true)}
                type="button"
              >
                <span className="grid gap-1">
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                </span>
              </button>

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">User Dashboard</p>
                <h1 className="mt-1 truncate text-xl font-black sm:text-2xl">Welcome back, {member?.fullName.split(" ")[0] || "Member"}</h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  aria-label="Notifications"
                  className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-red-300 transition hover:border-red-400 hover:bg-red-600 hover:text-white"
                  type="button"
                >
                  <NotificationIcon />
                </button>
                <ProfileChip member={member} />
              </div>
            </div>
          </header>

          <section className="mx-auto w-[min(1180px,calc(100%-24px))] py-6 sm:py-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.38fr]">
              <div className="min-w-0 space-y-6">
                <ProfileHero member={member} onEdit={() => setIsEditing(true)} />
                <DashboardCards member={member} remainingDays={remainingDays} />
                <QuickActions onEdit={() => setIsEditing(true)} />
                <BookingHistory bookings={memberBookings} />
              </div>

              <div className="min-w-0 space-y-6">
                <MembershipProgress member={member} progress={progress} remainingDays={remainingDays} />
                <RecentActivity activity={activity} />
              </div>
            </div>
          </section>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm xl:hidden" onClick={() => setIsMenuOpen(false)}>
          <aside
            className="h-full w-[min(86vw,20rem)] border-r border-white/10 bg-zinc-950 p-5 shadow-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <DashboardBrand />
              <button
                aria-label="Close dashboard menu"
                className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-xl font-bold transition hover:bg-red-600"
                onClick={() => setIsMenuOpen(false)}
                type="button"
              >
                x
              </button>
            </div>
            <DashboardNav compact />
          </aside>
        </div>
      ) : null}

      {isEditing && member ? <EditProfileModal member={member} onClose={() => setIsEditing(false)} /> : null}
    </main>
  );
}

function DashboardBrand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-md bg-red-600 text-sm font-black shadow-red">PH</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-black uppercase tracking-wide">CORE X</p>
        <p className="text-xs font-bold text-zinc-500">Member Area</p>
      </div>
    </div>
  );
}

function DashboardNav({ compact = false }: { compact?: boolean }) {
  return (
    <nav className={compact ? "mt-8 grid gap-2" : "mt-10 grid gap-2"}>
      {navItems.map((item, index) => (
        <button
          className={`rounded-2xl border px-4 py-3 text-left text-sm font-black uppercase tracking-wide transition ${
            index === 0
              ? "border-red-500/60 bg-red-600/15 text-red-300"
              : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-red-400/60 hover:text-red-200"
          }`}
          key={item}
          type="button"
        >
          {item}
        </button>
      ))}
    </nav>
  );
}

function ProfileChip({ member }: { member?: MemberData }) {
  return (
    <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] py-2 pl-2 pr-4 sm:flex">
      <Image alt="User profile" className="rounded-full object-cover" height={44} src={profileImage} width={44} />
      <div>
        <p className="text-sm font-black">{member?.fullName || "Gym Member"}</p>
        <p className="text-xs font-bold text-red-300">{member?.membershipStatus || "Active"} Member</p>
      </div>
    </div>
  );
}

function ProfileHero({ member, onEdit }: { member?: MemberData; onEdit: () => void }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(220,38,38,0.22),rgba(17,18,23,0.96)_48%,rgba(255,255,255,0.06))] p-5 shadow-card sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Image alt={member?.fullName || "Member profile"} className="size-20 rounded-2xl object-cover ring-2 ring-red-500/40" height={88} priority src={profileImage} width={88} />
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-red-200">Member Profile</p>
            <h2 className="mt-2 text-2xl font-black leading-tight sm:text-4xl">{member?.fullName || "Gym Member"}</h2>
            <p className="mt-2 text-sm font-semibold text-zinc-300">{member?.phoneNumber || "Phone not set"} · {member?.email || "Email not set"}</p>
            <p className="mt-1 text-sm font-semibold text-red-200">Membership status: {member?.membershipStatus || "active"}</p>
          </div>
        </div>
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Member ID</p>
            <p className="mt-1 text-lg font-black text-white">{member?.memberId || "PHF-MEMBER"}</p>
          </div>
          <button className="rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-500" onClick={onEdit} type="button">
            Edit Profile
          </button>
        </div>
      </div>
    </section>
  );
}

function DashboardCards({ member, remainingDays }: { member?: MemberData; remainingDays: number }) {
  const cards = [
    { label: "Current Plan", value: member?.selectedPlan || "No Plan", note: "Active membership plan" },
    { label: "Membership Start Date", value: formatGymDate(member?.membershipStartDate || ""), note: "Training cycle starts" },
    { label: "Membership End Date", value: formatGymDate(member?.membershipEndDate || ""), note: "Renewal target date" },
    { label: "Remaining Days", value: String(remainingDays), note: "Days left in membership" },
    { label: "Payment Status", value: member?.paymentStatus || "pending", note: "Manager confirmation" }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article className="min-w-0 rounded-2xl border border-white/10 bg-[#111217]/95 p-5 shadow-card transition hover:-translate-y-1 hover:border-red-500/50" key={card.label}>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-400">{card.label}</p>
          <h3 className="mt-3 break-words text-xl font-black capitalize leading-tight">{card.value}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{card.note}</p>
        </article>
      ))}
    </section>
  );
}

function QuickActions({ onEdit }: { onEdit: () => void }) {
  const actions = [
    { label: "Book New Plan", href: "/plans" },
    { label: "View Membership", href: "#membership" },
    { label: "Contact Gym", href: "/contact" }
  ];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#111217]/95 p-5 shadow-card sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Quick Actions</p>
      <h2 className="mt-2 text-2xl font-black">Manage your gym account</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action, index) => (
          <a
            className={`rounded-full px-5 py-3 text-center text-sm font-black uppercase tracking-wide transition hover:-translate-y-0.5 ${
              index === 0 ? "bg-red-600 text-white shadow-red hover:bg-red-500" : "border border-white/10 bg-white/[0.05] text-white hover:border-red-400"
            }`}
            href={action.href}
            key={action.label}
          >
            {action.label}
          </a>
        ))}
        <button className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:border-red-400" onClick={onEdit} type="button">
          Edit Profile
        </button>
      </div>
    </section>
  );
}

function MembershipProgress({ member, progress, remainingDays }: { member?: MemberData; progress: number; remainingDays: number }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#111217]/95 p-5 shadow-card sm:p-6" id="membership">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Membership Progress</p>
      <h2 className="mt-2 text-2xl font-black">{remainingDays} days remaining</h2>
      <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="h-full rounded-full bg-red-600 shadow-red" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm font-bold text-zinc-400">
        <span>{progress}% active</span>
        <span>Renewal: {formatGymDate(member?.membershipEndDate || "")}</span>
      </div>
    </section>
  );
}

function BookingHistory({ bookings }: { bookings: GymDataStore["bookings"] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#111217]/95 p-5 shadow-card sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Booking History</p>
      <h2 className="mt-2 text-2xl font-black">Recent plan requests</h2>
      <div className="mt-5 grid gap-3">
        {bookings.length ? bookings.map((booking) => (
          <article className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center" key={booking.bookingId}>
            <div>
              <h3 className="font-black">{booking.selectedPlan}</h3>
              <p className="mt-1 text-sm text-zinc-400">{formatGymDate(booking.bookingDate)}</p>
            </div>
            <span className="w-fit rounded-full border border-red-500/35 bg-red-600/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-red-200">
              {booking.bookingStatus}
            </span>
            <span className="text-xs font-black uppercase tracking-wide text-zinc-400">{booking.bookingId}</span>
          </article>
        )) : <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">No bookings found yet.</p>}
      </div>
    </section>
  );
}

function RecentActivity({ activity }: { activity: string[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#111217]/95 p-5 shadow-card sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Recent Activity</p>
      <h2 className="mt-2 text-2xl font-black">Updates</h2>
      <div className="mt-5 space-y-4">
        {activity.map((item, index) => (
          <div className="flex gap-3" key={`${item}-${index}`}>
            <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-red-600/20 text-xs font-black text-red-200 ring-1 ring-red-500/35">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="font-black">{item}</p>
              <p className="mt-1 text-sm text-zinc-500">Synced from gym records</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EditProfileModal({ member, onClose }: { member: MemberData; onClose: () => void }) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    saveMember({
      ...member,
      fullName: String(form.get("fullName") || member.fullName),
      phoneNumber: String(form.get("phoneNumber") || member.phoneNumber),
      email: String(form.get("email") || member.email),
      selectedPlan: member.selectedPlan,
      membershipStartDate: member.membershipStartDate,
      membershipEndDate: member.membershipEndDate,
      paymentStatus: member.paymentStatus
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <form className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#111217] p-6 shadow-card" onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Edit Profile</p>
            <h2 className="mt-2 text-2xl font-black">Update member details</h2>
          </div>
          <button className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-xl font-bold transition hover:bg-red-600" onClick={onClose} type="button">x</button>
        </div>
        <div className="mt-6 grid gap-4">
          <input className="contact-input" defaultValue={member.fullName} name="fullName" placeholder="Full name" required />
          <input className="contact-input" defaultValue={member.phoneNumber} name="phoneNumber" placeholder="Phone number" required />
          <input className="contact-input" defaultValue={member.email} name="email" placeholder="Email" required type="email" />
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button className="rounded-full bg-red-600 px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:bg-red-500" type="submit">Save Profile</button>
          <button className="rounded-full border border-white/15 px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:border-red-400" onClick={onClose} type="button">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function buildActivity(store: GymDataStore, member?: MemberData) {
  const items = [
    ...(member ? [`${member.fullName} joined gym`, `${member.selectedPlan} membership active`] : []),
    ...store.bookings.slice(0, 3).map((booking) => `${booking.userName} booking submitted`),
    ...store.payments.slice(0, 2).map((payment) => `${payment.memberName} payment ${payment.paymentStatus}`)
  ];

  return items.length ? items.slice(0, 5) : ["Gym account created"];
}

function NotificationIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}
