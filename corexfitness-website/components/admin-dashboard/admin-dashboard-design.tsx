"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ContentManagementPanel } from "@/components/admin-dashboard/content-management";
import { emptyGymDataStore, type BookingStatus, type GymDataStore, type MemberData, type PaymentStatus } from "@/lib/gym-data-models";
import {
  addMonths,
  deleteMember,
  formatCurrency,
  formatGymDate,
  getGymSettings,
  getPlanDurationMonths,
  getPlanPrice,
  loadGymDataStore,
  saveGymSettings,
  saveMember,
  subscribeGymDataStore,
  syncGymDataStoreFromServer,
  today,
  updateBookingStatus
} from "@/lib/gym-management-store";

const sidebarItems = ["Dashboard", "Members", "Bookings", "Payments", "Revenue", "Notifications", "Settings", "Content"] as const;
const planOptions = ["Beginner Plan", "Standard Plan", "Premium Plan"];
const paymentOptions: PaymentStatus[] = ["paid", "unpaid", "pending", "cash_on_gym"];
const bookingStatusOptions: BookingStatus[] = ["submitted", "confirmed", "cancelled", "completed"];
type AdminSection = (typeof sidebarItems)[number];

export function AdminDashboardDesign() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>("Dashboard");
  const [store, setStore] = useState<GymDataStore>(emptyGymDataStore);
  const [search, setSearch] = useState("");
  const [editingMember, setEditingMember] = useState<MemberData | null>(null);
  const [renewingMember, setRenewingMember] = useState<MemberData | null>(null);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  useEffect(() => {
    setStore(loadGymDataStore());
    void syncGymDataStoreFromServer().then(setStore);
    return subscribeGymDataStore(() => setStore(loadGymDataStore()));
  }, []);

  const activeMembers = useMemo(() => store.members.filter(isActiveMember), [store.members]);
  const expiredMembers = useMemo(() => store.members.filter((member) => !isActiveMember(member)), [store.members]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return activeMembers;

    return activeMembers.filter((member) =>
      [member.fullName, member.phoneNumber, member.email].some((value) => value.toLowerCase().includes(query))
    );
  }, [activeMembers, search]);

  const stats = getStats(store, activeMembers, expiredMembers);
  const notifications = getNotifications(store, expiredMembers);

  return (
    <main className="min-h-screen overflow-x-hidden scroll-smooth bg-[#070707] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-black/80 p-6 xl:block">
          <AdminNav activeSection={activeSection} onSelect={setActiveSection} />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-black/75 backdrop-blur-xl">
            <div className="mx-auto flex min-h-16 w-[min(1200px,calc(100%-24px))] items-center justify-between gap-3 sm:min-h-20 sm:gap-4">
              <button
                aria-label="Open admin menu"
                className="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white transition hover:border-red-400 sm:size-11 xl:hidden"
                onClick={() => setIsMenuOpen(true)}
                type="button"
              >
                <span className="grid gap-1">
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                </span>
              </button>

              <Link aria-label="CORE X FITNESS home" className="flex shrink-0 items-center" href="/">
                <img alt="CORE X FITNESS logo" className="h-12 w-44 object-contain object-left sm:h-14 sm:w-56" src="/images/navbar-logo-fit.png" />
              </Link>

              <div className="min-w-0 flex-1" aria-hidden="true" />

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <button aria-label="Admin notifications" className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-red-300 transition hover:border-red-400 hover:bg-red-600 hover:text-white sm:size-11" onClick={() => setActiveSection("Notifications")} type="button">
                  <BellIcon />
                </button>
                <form action="/api/admin/logout" method="post">
                  <button className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-white transition hover:border-red-400 sm:px-4 sm:py-3 sm:text-sm" type="submit">
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </header>

          <section className="mx-auto w-[min(1200px,calc(100%-24px))] pb-24 pt-6 sm:py-8">
            <AdminSectionView
              activeSection={activeSection}
              filteredMembers={filteredMembers}
              notifications={notifications}
              onEditMember={setEditingMember}
              onRenewMember={setRenewingMember}
              search={search}
              setSearch={setSearch}
              stats={stats}
              store={store}
              activeMembers={activeMembers}
              expiredMembers={expiredMembers}
            />
          </section>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm xl:hidden" onClick={() => setIsMenuOpen(false)}>
          <aside className="h-full w-[min(86vw,20rem)] border-r border-white/10 bg-zinc-950 p-5 shadow-card" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-end gap-4">
              <button aria-label="Close admin menu" className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-xl font-bold transition hover:bg-red-600" onClick={() => setIsMenuOpen(false)} type="button">
                x
              </button>
            </div>
            <AdminNav
              activeSection={activeSection}
              compact
              onSelect={(section) => {
                setActiveSection(section);
                setIsMenuOpen(false);
              }}
            />
          </aside>
        </div>
      ) : null}

      {editingMember ? <MemberEditor member={editingMember} onClose={() => setEditingMember(null)} /> : null}
      {renewingMember ? <RenewMemberModal member={renewingMember} onClose={() => setRenewingMember(null)} /> : null}
      <MobileBottomNav
        activeSection={activeSection}
        isMoreOpen={isMobileMoreOpen}
        onSelect={(section) => {
          setActiveSection(section);
          setIsMobileMoreOpen(false);
        }}
        onToggleMore={() => setIsMobileMoreOpen((current) => !current)}
      />
    </main>
  );
}

function AdminNav({
  activeSection,
  compact = false,
  onSelect
}: {
  activeSection: AdminSection;
  compact?: boolean;
  onSelect: (section: AdminSection) => void;
}) {
  return (
    <nav className={compact ? "mt-8 grid gap-2" : "grid gap-2"}>
      {sidebarItems.map((item) => (
        <button
          className={`rounded-2xl border px-4 py-3 text-left text-sm font-black uppercase tracking-wide transition ${
            item === activeSection ? "border-red-500/60 bg-red-600/15 text-red-300" : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-red-400/60 hover:text-red-200"
          }`}
          key={item}
          onClick={() => onSelect(item)}
          type="button"
        >
          {item}
        </button>
      ))}
    </nav>
  );
}

function AdminSectionView({
  activeMembers,
  activeSection,
  expiredMembers,
  filteredMembers,
  notifications,
  onEditMember,
  onRenewMember,
  search,
  setSearch,
  stats,
  store
}: {
  activeMembers: MemberData[];
  activeSection: AdminSection;
  expiredMembers: MemberData[];
  filteredMembers: MemberData[];
  notifications: string[];
  onEditMember: (member: MemberData) => void;
  onRenewMember: (member: MemberData) => void;
  search: string;
  setSearch: (value: string) => void;
  stats: { label: string; value: string; note: string }[];
  store: GymDataStore;
}) {
  if (activeSection === "Members") {
    return (
      <div className="grid gap-6">
        <GymSheet members={activeMembers} />
        <MembersManagement members={filteredMembers} onEdit={onEditMember} search={search} setSearch={setSearch} />
        <ExpiredMembers members={expiredMembers} onRenew={onRenewMember} />
      </div>
    );
  }

  if (activeSection === "Bookings") {
    return <RecentBookings store={store} />;
  }

  if (activeSection === "Payments") {
    return <PaymentSection store={store} />;
  }

  if (activeSection === "Revenue") {
    return <RevenueSection store={store} />;
  }

  if (activeSection === "Notifications") {
    return <Notifications items={notifications} />;
  }

  if (activeSection === "Settings") {
    return <SettingsSection store={store} />;
  }

  if (activeSection === "Content") {
    return <ContentManagementPanel />;
  }

  return (
    <div className="grid gap-6">
      <StatsGrid stats={stats} />
      <ExportPanel store={store} />
      <DashboardMemberWorkspace members={store.members} onEdit={onEditMember} />
    </div>
  );
}

function StatsGrid({ stats }: { stats: { label: string; value: string; note: string }[] }) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
      {stats.map((card) => (
        <article className="min-w-0 rounded-2xl border border-white/10 bg-[#111217]/95 p-4 shadow-card transition hover:-translate-y-1 hover:border-red-500/50 hover:shadow-red sm:p-5" key={card.label}>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-400 sm:text-xs sm:tracking-[0.18em]">{card.label}</p>
          <h2 className="mt-2 break-words text-xl font-black leading-tight sm:mt-3 sm:text-2xl">{card.value}</h2>
          <p className="mt-1 text-xs leading-5 text-zinc-400 sm:mt-2 sm:text-sm sm:leading-6">{card.note}</p>
        </article>
      ))}
    </section>
  );
}

function DashboardMemberWorkspace({ members, onEdit }: { members: MemberData[]; onEdit: (member: MemberData) => void }) {
  const [memberSearch, setMemberSearch] = useState("");
  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    if (!query) return members;

    return members.filter((member) => [member.fullName, member.phoneNumber, member.email].some((value) => value.toLowerCase().includes(query)));
  }, [memberSearch, members]);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111217]/95 p-4 shadow-card sm:rounded-[2rem] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Member Workspace</p>
          <h2 className="mt-2 text-xl font-black sm:text-2xl">Real member records</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input className="contact-input min-w-0 sm:w-72" onChange={(event) => setMemberSearch(event.target.value)} placeholder="Search member" value={memberSearch} />
          <button className="rounded-full bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:bg-red-500" onClick={() => onEdit(createBlankMember())} type="button">
            Add Member
          </button>
        </div>
      </div>

      <div className="mt-5 hidden overflow-x-auto md:block">
        <div className="min-w-[720px] rounded-2xl border border-white/10">
          <div className="grid grid-cols-[0.55fr_1.2fr_1fr_0.9fr_0.9fr] gap-3 border-b border-white/10 bg-white/[0.04] p-4 text-xs font-black uppercase tracking-wide text-zinc-400">
            <span>Profile</span><span>Name</span><span>Phone Number</span><span>Join Date</span><span>Actions</span>
          </div>
          {filteredMembers.length ? filteredMembers.map((member) => (
            <div className="grid cursor-pointer grid-cols-[0.55fr_1.2fr_1fr_0.9fr_0.9fr] gap-3 border-b border-white/10 p-4 text-sm transition hover:bg-white/[0.03] last:border-b-0" key={member.memberId} onClick={() => onEdit(member)} role="button" tabIndex={0}>
              <MemberAvatar member={member} />
              <span className="self-center font-black">{member.fullName || "Unnamed Member"}</span>
              <span className="self-center text-zinc-300">{member.phoneNumber || "Not set"}</span>
              <span className="self-center text-zinc-400">{formatGymDate(member.membershipStartDate)}</span>
              <span className="flex gap-2 self-center">
                <button className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-white transition hover:border-red-400" onClick={(event) => { event.stopPropagation(); onEdit(member); }} type="button">Edit</button>
                <button className="rounded-full border border-red-500/40 px-3 py-1 text-xs font-black text-red-200 transition hover:bg-red-600 hover:text-white" onClick={(event) => { event.stopPropagation(); deleteMember(member.memberId); }} type="button">Delete</button>
              </span>
            </div>
          )) : <p className="p-4 text-sm text-zinc-400">No members yet.</p>}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:hidden">
        {filteredMembers.length ? filteredMembers.map((member) => (
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={member.memberId}>
            <button className="flex w-full items-center gap-3 text-left" onClick={() => onEdit(member)} type="button">
              <MemberAvatar member={member} />
              <span className="min-w-0">
                <span className="block truncate text-base font-black">{member.fullName || "Unnamed Member"}</span>
                <span className="mt-1 block text-sm text-zinc-400">{member.phoneNumber || "Not set"}</span>
                <span className="mt-1 block text-xs font-bold text-red-200">{formatGymDate(member.membershipStartDate)}</span>
              </span>
            </button>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="rounded-full border border-white/10 px-3 py-3 text-xs font-black text-white transition hover:border-red-400" onClick={() => onEdit(member)} type="button">Edit</button>
              <button className="rounded-full border border-red-500/40 px-3 py-3 text-xs font-black text-red-200 transition hover:bg-red-600 hover:text-white" onClick={() => deleteMember(member.memberId)} type="button">Delete</button>
            </div>
          </article>
        )) : <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">No members yet.</p>}
      </div>
    </section>
  );
}

function GymSheet({ members }: { members: MemberData[] }) {
  function updateMemberCell(member: MemberData, field: keyof MemberData, value: string) {
    const selectedPlan = field === "selectedPlan" ? value : member.selectedPlan;
    const startDate = field === "membershipStartDate" ? value : member.membershipStartDate;
    const planChanged = field === "selectedPlan";
    const startChanged = field === "membershipStartDate";

    saveMember({
      ...member,
      fullName: field === "fullName" ? value : member.fullName,
      phoneNumber: field === "phoneNumber" ? value : member.phoneNumber,
      email: field === "email" ? value : member.email,
      selectedPlan,
      membershipStartDate: startDate,
      membershipEndDate: field === "membershipEndDate" ? value : planChanged || startChanged ? addMonths(startDate, getPlanDurationMonths(selectedPlan)) : member.membershipEndDate,
      paymentStatus: field === "paymentStatus" ? (value as PaymentStatus) : member.paymentStatus,
      feesAmount: field === "feesAmount" ? Number(value) || 0 : planChanged ? getPlanPrice(selectedPlan) : member.feesAmount ?? getPlanPrice(selectedPlan),
      notes: field === "notes" ? value : member.notes || ""
    });
  }

  function addSheetRow() {
    const startDate = today();
    saveMember({
      fullName: "",
      phoneNumber: "",
      email: "",
      selectedPlan: "Beginner Plan",
      membershipStartDate: startDate,
      membershipEndDate: addMonths(startDate, 1),
      paymentStatus: "pending",
      feesAmount: getPlanPrice("Beginner Plan"),
      notes: ""
    });
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111217]/95 p-4 shadow-card sm:rounded-[2rem] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Gym Sheet</p>
          <h2 className="mt-2 text-xl font-black sm:text-2xl">Editable member workspace</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Update members, fees, payment status, and notes from one sheet.</p>
        </div>
        <button className="rounded-full bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:bg-red-500" onClick={addSheetRow} type="button">
          Add Row
        </button>
      </div>

      <div className="mt-5 hidden overflow-x-auto md:block">
        <div className="min-w-[920px] rounded-2xl border border-white/10">
          <div className="grid grid-cols-[1fr_0.95fr_1.15fr_0.95fr_0.85fr_0.95fr_0.9fr_0.55fr] gap-2 border-b border-white/10 bg-white/[0.04] p-3 text-xs font-black uppercase tracking-wide text-zinc-400">
            <span>First Name</span>
            <span>Phone Number</span>
            <span>Email</span>
            <span>Selected Plan</span>
            <span>Join Date</span>
            <span>Membership End Date</span>
            <span>Payment Status</span>
            <span>Delete</span>
          </div>
          {members.map((member) => (
            <div className="grid grid-cols-[1fr_0.95fr_1.15fr_0.95fr_0.85fr_0.95fr_0.9fr_0.55fr] gap-2 border-b border-white/10 p-3 last:border-b-0" key={member.memberId}>
              <SheetInput ariaLabel="First Name" onCommit={(value) => updateMemberCell(member, "fullName", value)} value={member.fullName} />
              <SheetInput ariaLabel="Phone Number" onCommit={(value) => updateMemberCell(member, "phoneNumber", value)} value={member.phoneNumber} />
              <SheetInput ariaLabel="Email" onCommit={(value) => updateMemberCell(member, "email", value)} value={member.email} />
              <SheetSelect ariaLabel="Selected Plan" onCommit={(value) => updateMemberCell(member, "selectedPlan", value)} options={planOptions} value={member.selectedPlan} />
              <SheetInput ariaLabel="Join Date" onCommit={(value) => updateMemberCell(member, "membershipStartDate", value)} type="date" value={member.membershipStartDate} />
              <SheetInput ariaLabel="Membership End Date" onCommit={(value) => updateMemberCell(member, "membershipEndDate", value)} type="date" value={member.membershipEndDate} />
              <SheetSelect ariaLabel="Payment Status" onCommit={(value) => updateMemberCell(member, "paymentStatus", value)} options={paymentOptions} value={member.paymentStatus} />
              <button className="rounded-xl border border-red-500/40 px-3 py-2 text-xs font-black text-red-200 transition hover:bg-red-600 hover:text-white" onClick={() => deleteMember(member.memberId)} type="button">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:hidden">
        {members.length ? members.map((member) => (
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={member.memberId}>
            <div className="grid gap-3">
              <SheetInput ariaLabel="First Name" onCommit={(value) => updateMemberCell(member, "fullName", value)} value={member.fullName} />
              <SheetInput ariaLabel="Phone Number" onCommit={(value) => updateMemberCell(member, "phoneNumber", value)} value={member.phoneNumber} />
              <SheetInput ariaLabel="Email" onCommit={(value) => updateMemberCell(member, "email", value)} value={member.email} />
              <SheetSelect ariaLabel="Selected Plan" onCommit={(value) => updateMemberCell(member, "selectedPlan", value)} options={planOptions} value={member.selectedPlan} />
              <SheetInput ariaLabel="Join Date" onCommit={(value) => updateMemberCell(member, "membershipStartDate", value)} type="date" value={member.membershipStartDate} />
              <SheetInput ariaLabel="Membership End Date" onCommit={(value) => updateMemberCell(member, "membershipEndDate", value)} type="date" value={member.membershipEndDate} />
              <SheetSelect ariaLabel="Payment Status" onCommit={(value) => updateMemberCell(member, "paymentStatus", value)} options={paymentOptions} value={member.paymentStatus} />
              <button className="rounded-xl border border-red-500/40 px-3 py-3 text-xs font-black text-red-200 transition hover:bg-red-600 hover:text-white" onClick={() => deleteMember(member.memberId)} type="button">
                Delete Row
              </button>
            </div>
          </article>
        )) : <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">No active members yet.</p>}
      </div>
    </section>
  );
}

function ExportPanel({ store }: { store: GymDataStore }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#111217]/95 p-4 shadow-card sm:rounded-[2rem] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Export</p>
          <h2 className="mt-2 text-xl font-black sm:text-2xl">Download gym records</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <button className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:border-red-400" onClick={() => exportMembers(store.members)} type="button">
            Members
          </button>
          <button className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:border-red-400" onClick={() => exportPayments(store.payments)} type="button">
            Payments
          </button>
          <button className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:border-red-400" onClick={() => exportBookings(store)} type="button">
            Bookings
          </button>
        </div>
      </div>
    </section>
  );
}

function SheetInput({
  ariaLabel,
  onCommit,
  type = "text",
  value
}: {
  ariaLabel: string;
  onCommit: (value: string) => void;
  type?: string;
  value: string;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  return (
    <input
      aria-label={ariaLabel}
      className="min-w-0 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none transition focus:border-red-400"
      onBlur={() => {
        if (draft !== value) onCommit(draft);
      }}
      onChange={(event) => setDraft(event.target.value)}
      type={type}
      value={draft}
    />
  );
}

function SheetSelect({
  ariaLabel,
  onCommit,
  options,
  value
}: {
  ariaLabel: string;
  onCommit: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      className="min-w-0 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none transition focus:border-red-400"
      onChange={(event) => onCommit(event.target.value)}
      value={value}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {formatSelectOption(option)}
        </option>
      ))}
    </select>
  );
}

function MembersManagement({
  members,
  onEdit,
  search,
  setSearch
}: {
  members: MemberData[];
  onEdit: (member: MemberData) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#111217]/95 p-4 shadow-card sm:rounded-[2rem] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Members Management</p>
          <h2 className="mt-2 text-xl font-black sm:text-2xl">Members, plans, and fees</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input className="contact-input min-w-0 sm:w-72" onChange={(event) => setSearch(event.target.value)} placeholder="Search member" value={search} />
          <button className="rounded-full bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:bg-red-500" onClick={() => onEdit(createBlankMember())} type="button">
            Add Member
          </button>
        </div>
      </div>

      <div className="mt-5 hidden overflow-x-auto md:block">
        <div className="min-w-[760px] rounded-2xl border border-white/10">
          <div className="grid grid-cols-[1.15fr_1fr_1.1fr_0.9fr_0.85fr_0.85fr_0.8fr_0.9fr] gap-3 border-b border-white/10 bg-white/[0.04] p-4 text-xs font-black uppercase tracking-wide text-zinc-400">
            <span>First Name</span><span>Phone Number</span><span>Email</span><span>Selected Plan</span><span>Join Date</span><span>Membership End Date</span><span>Payment Status</span><span>Actions</span>
          </div>
          {members.length ? members.map((member) => (
            <div className="grid grid-cols-[1.15fr_1fr_1.1fr_0.9fr_0.85fr_0.85fr_0.8fr_0.9fr] gap-3 border-b border-white/10 p-4 text-sm last:border-b-0" key={member.memberId}>
              <span className="font-black">{member.fullName}</span>
              <span className="text-zinc-300">{member.phoneNumber}</span>
              <span className="break-words text-zinc-300">{member.email}</span>
              <span className="text-zinc-300">{member.selectedPlan}</span>
              <span className="text-zinc-400">{formatGymDate(member.membershipStartDate)}</span>
              <span className="text-zinc-400">{formatGymDate(member.membershipEndDate)}</span>
              <select
                className="rounded-xl border border-white/10 bg-black/25 px-2 py-1 text-sm capitalize text-red-200 outline-none"
                onChange={(event) =>
                  saveMember({
                    ...member,
                    paymentStatus: event.target.value as PaymentStatus,
                    feesAmount: member.feesAmount ?? getPlanPrice(member.selectedPlan),
                    notes: member.notes || ""
                  })
                }
                value={member.paymentStatus}
              >
                {paymentOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatPaymentStatus(status)}
                  </option>
                ))}
              </select>
              <span className="flex gap-2">
                <button className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-white transition hover:border-red-400" onClick={() => onEdit(member)} type="button">Edit</button>
                <a className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-green-200 transition hover:border-green-400" href={buildMemberWhatsAppHref(member)} target="_blank" rel="noreferrer">WhatsApp</a>
                <button className="rounded-full border border-red-500/40 px-3 py-1 text-xs font-black text-red-200 transition hover:bg-red-600 hover:text-white" onClick={() => deleteMember(member.memberId)} type="button">Delete</button>
              </span>
            </div>
          )) : <p className="p-4 text-sm text-zinc-400">No active members yet.</p>}
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:hidden">
        {members.length ? members.map((member) => (
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={member.memberId}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <MemberAvatar member={member} />
                <div className="min-w-0">
                  <p className="truncate text-base font-black">{member.fullName}</p>
                  <p className="text-xs font-bold text-red-200">{member.selectedPlan}</p>
                </div>
              </div>
              <p className="break-words text-sm text-zinc-400">{member.phoneNumber} | {member.email}</p>
              <p className="text-sm text-zinc-400">{formatGymDate(member.membershipStartDate)} - {formatGymDate(member.membershipEndDate)}</p>
              <select
                className="mt-2 rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-sm capitalize text-red-200 outline-none"
                onChange={(event) =>
                  saveMember({
                    ...member,
                    paymentStatus: event.target.value as PaymentStatus,
                    feesAmount: member.feesAmount ?? getPlanPrice(member.selectedPlan),
                    notes: member.notes || ""
                  })
                }
                value={member.paymentStatus}
              >
                {paymentOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatPaymentStatus(status)}
                  </option>
                ))}
              </select>
              <QuickPaymentActions member={member} />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="rounded-full border border-white/10 px-3 py-3 text-xs font-black text-white transition hover:border-red-400" onClick={() => onEdit(member)} type="button">Edit</button>
                <a className="rounded-full border border-white/10 px-3 py-3 text-center text-xs font-black text-green-200 transition hover:border-green-400" href={buildMemberWhatsAppHref(member)} target="_blank" rel="noreferrer">WhatsApp</a>
                <button className="col-span-2 rounded-full border border-red-500/40 px-3 py-3 text-xs font-black text-red-200 transition hover:bg-red-600 hover:text-white" onClick={() => deleteMember(member.memberId)} type="button">Delete</button>
              </div>
            </div>
          </article>
        )) : <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">No active members yet.</p>}
      </div>
    </section>
  );
}

function MemberAvatar({ member }: { member: MemberData }) {
  const initial = member.fullName.trim().charAt(0).toUpperCase();

  if (member.profileImage) {
    return <img alt="" className="size-12 shrink-0 rounded-2xl object-cover ring-1 ring-red-500/35" decoding="async" loading="lazy" src={member.profileImage} />;
  }

  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-red-600/20 text-sm font-black text-red-100 ring-1 ring-red-500/35">
      {initial || "P"}
    </span>
  );
}

function QuickPaymentActions({ member }: { member: MemberData }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {paymentOptions.map((status) => (
        <button
          className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-wide transition ${
            member.paymentStatus === status ? "bg-red-600 text-white shadow-red" : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-red-400"
          }`}
          key={status}
          onClick={() =>
            saveMember({
              ...member,
              paymentStatus: status,
              feesAmount: member.feesAmount ?? getPlanPrice(member.selectedPlan),
              notes: member.notes || ""
            })
          }
          type="button"
        >
          {formatPaymentStatus(status)}
        </button>
      ))}
    </div>
  );
}

function RecentBookings({ store }: { store: GymDataStore }) {
  const [filterDate, setFilterDate] = useState("");
  const todayDate = today();
  const yesterdayDate = getRelativeDate(-1);
  const filteredBookings = filterDate ? store.bookings.filter((booking) => booking.bookingDate === filterDate) : store.bookings;
  const todayBookings = filteredBookings.filter((booking) => booking.bookingDate === todayDate);
  const yesterdayBookings = filteredBookings.filter((booking) => booking.bookingDate === yesterdayDate);
  const olderBookings = filteredBookings.filter((booking) => booking.bookingDate !== todayDate && booking.bookingDate !== yesterdayDate);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111217]/95 p-4 shadow-card sm:rounded-[2rem] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Booking Management</p>
          <h2 className="mt-2 text-xl font-black sm:text-2xl">Full booking history</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input className="contact-input" onChange={(event) => setFilterDate(event.target.value)} type="date" value={filterDate} />
          {filterDate ? (
            <button className="rounded-full border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:border-red-400" onClick={() => setFilterDate("")} type="button">
              Clear
            </button>
          ) : null}
        </div>
      </div>
      <BookingGroup bookings={todayBookings} store={store} title="Today's bookings" />
      <BookingGroup bookings={yesterdayBookings} store={store} title="Yesterday bookings" />
      <BookingGroup bookings={olderBookings} store={store} title="Full booking history" />
    </section>
  );
}

function BookingGroup({ bookings, store, title }: { bookings: GymDataStore["bookings"]; store: GymDataStore; title: string }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">{title}</h3>
      <div className="mt-3 grid gap-3">
        {bookings.length ? bookings.map((booking) => <BookingCard booking={booking} key={booking.bookingId} store={store} />) : (
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">No bookings.</p>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking, store }: { booking: GymDataStore["bookings"][number]; store: GymDataStore }) {
  const contact = getBookingContact(booking, store);

  return (
    <article className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1fr_0.85fr_0.85fr_0.75fr_auto] md:items-center">
      <div className="min-w-0">
        <p className="text-sm font-black text-white">{booking.userName}</p>
        <p className="mt-1 break-words text-xs text-zinc-500">{contact.phoneNumber} | {contact.email}</p>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-zinc-300">{booking.selectedPlan}</p>
        <p className="mt-1 text-xs font-black text-red-200">Amount: {formatCurrency(contact.feesAmount)}</p>
      </div>
      <p className="text-sm font-bold text-zinc-400">{formatGymDate(booking.bookingDate)} {booking.bookingTime || ""}</p>
      <div className="min-w-0">
        <p className="text-sm font-black text-red-200">{formatBookingPaymentStatus(contact.paymentStatus, contact.paymentMethod)}</p>
        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-zinc-500">{formatPaymentMethod(contact.paymentMethod)}</p>
      </div>
      <select
        className="w-fit rounded-full border border-red-500/35 bg-red-600/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-red-200 outline-none"
        onChange={(event) => updateBookingStatus(booking.bookingId, event.target.value as BookingStatus)}
        value={booking.bookingStatus}
      >
        {bookingStatusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </article>
  );
}

function PaymentSection({ store }: { store: GymDataStore }) {
  const paid = store.members.filter((member) => member.paymentStatus === "paid");
  const unpaid = store.members.filter((member) => member.paymentStatus === "unpaid");
  const pending = store.members.filter((member) => member.paymentStatus === "pending");
  const cards = [
    { label: "Paid", value: formatCurrency(sumPlanValue(paid)), detail: `${paid.length} members` },
    { label: "Unpaid", value: formatCurrency(sumPlanValue(unpaid)), detail: `${unpaid.length} members` },
    { label: "Pending Fees", value: formatCurrency(sumPlanValue(pending)), detail: `${pending.length} members` }
  ];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#111217]/95 p-5 shadow-card sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Payment Management</p>
      <h2 className="mt-2 text-xl font-black sm:text-2xl">Fee overview</h2>
      <div className="mt-5 grid gap-3">
        {cards.map((card) => (
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-red-500/50" key={card.label}>
            <div className="flex items-center justify-between gap-4">
              <p className="font-black">{card.label}</p>
              <p className="text-lg font-black text-red-400">{card.value}</p>
            </div>
            <p className="mt-2 text-sm text-zinc-500">{card.detail}</p>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-2 text-sm text-zinc-300">
        {store.payments.length ? store.payments.map((payment) => (
          <p className="rounded-xl border border-white/10 bg-white/[0.04] p-3" key={payment.paymentId}>
            {payment.memberName} - {formatCurrency(payment.amount)} - {formatPaymentMethod(payment.paymentMethod)} - <span className="text-red-200">{formatBookingPaymentStatus(payment.paymentStatus, payment.paymentMethod)}</span> - {formatGymDate(payment.paymentDate)}
          </p>
        )) : <p className="rounded-xl border border-white/10 bg-white/[0.04] p-3">No payment history yet.</p>}
      </div>
    </section>
  );
}

function ExpiredMembers({
  members,
  onRenew
}: {
  members: MemberData[];
  onRenew: (member: MemberData) => void;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#111217]/95 p-4 shadow-card sm:rounded-[2rem] sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Expired Members</p>
      <h2 className="mt-2 text-xl font-black sm:text-2xl">Membership history</h2>
      <div className="mt-5 grid gap-3">
        {members.length ? members.map((member) => (
          <article className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1fr_0.85fr_0.85fr_auto] md:items-center" key={member.memberId}>
            <div className="min-w-0">
              <p className="font-black">{member.fullName}</p>
              <p className="mt-1 break-words text-sm text-zinc-400">{member.phoneNumber} | {member.email}</p>
            </div>
            <p className="text-sm font-bold text-zinc-300">{member.selectedPlan}</p>
            <p className="text-sm text-red-200">Ended {formatGymDate(member.membershipEndDate)}</p>
            <span className="flex flex-col gap-2 sm:flex-row">
              <button className="rounded-full bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-wide text-white shadow-red transition hover:bg-red-500" onClick={() => onRenew(member)} type="button">
                Renew
              </button>
              <button className="rounded-full border border-red-500/40 px-5 py-3 text-xs font-black uppercase tracking-wide text-red-200 transition hover:bg-red-600 hover:text-white" onClick={() => deleteMember(member.memberId)} type="button">
                Delete History
              </button>
            </span>
          </article>
        )) : <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">No expired members.</p>}
      </div>
    </section>
  );
}

function MobileBottomNav({
  activeSection,
  isMoreOpen,
  onSelect,
  onToggleMore
}: {
  activeSection: AdminSection;
  isMoreOpen: boolean;
  onSelect: (section: AdminSection) => void;
  onToggleMore: () => void;
}) {
  const mobileItems: { icon: "dashboard" | "members" | "booking" | "payments"; label: string; section: AdminSection }[] = [
    { icon: "dashboard", label: "Dash", section: "Dashboard" },
    { icon: "members", label: "Members", section: "Members" },
    { icon: "booking", label: "Booking", section: "Bookings" },
    { icon: "payments", label: "Pay", section: "Payments" }
  ];
  const moreItems: AdminSection[] = ["Revenue", "Notifications", "Settings", "Content"];
  const isMoreActive = moreItems.includes(activeSection);

  return (
    <>
      {isMoreOpen ? (
        <div className="fixed inset-x-3 bottom-20 z-50 rounded-[1.5rem] border border-white/10 bg-zinc-950/95 p-3 shadow-card backdrop-blur-xl xl:hidden">
          <div className="grid gap-2">
            {moreItems.map((item) => (
              <button
                className={`rounded-2xl px-4 py-3 text-left text-xs font-black uppercase tracking-wide transition ${
                  item === activeSection ? "bg-red-600 text-white shadow-red" : "bg-white/[0.05] text-zinc-300"
                }`}
                key={item}
                onClick={() => onSelect(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <nav className="fixed bottom-0 left-0 right-0 z-40 box-border grid w-full max-w-full grid-cols-[repeat(5,minmax(0,1fr))] overflow-x-hidden border-t border-white/10 bg-black/90 px-0.5 py-0.5 pb-[calc(0.125rem+env(safe-area-inset-bottom))] backdrop-blur-xl sm:py-1 xl:hidden">
        {mobileItems.map((item) => (
          <button
            aria-label={item.section}
            className={`box-border flex min-w-0 overflow-hidden flex-col items-center justify-center gap-px rounded-md p-[2px] text-center text-[clamp(6px,2.1vw,8px)] font-black uppercase leading-none tracking-normal transition sm:p-[3px] sm:text-[clamp(6.5px,2.25vw,9px)] ${
              item.section === activeSection ? "bg-red-600 text-white shadow-red" : "bg-white/[0.05] text-zinc-300"
            }`}
            key={item.section}
            onClick={() => onSelect(item.section)}
            type="button"
          >
            <AdminBottomNavIcon name={item.icon} />
            <span className="block max-w-full truncate whitespace-nowrap">{item.label}</span>
          </button>
        ))}
        <button
          aria-label="More admin sections"
          className={`box-border flex min-w-0 overflow-hidden flex-col items-center justify-center gap-px rounded-md p-[2px] text-center text-[clamp(6px,2.1vw,8px)] font-black uppercase leading-none tracking-normal transition sm:p-[3px] sm:text-[clamp(6.5px,2.25vw,9px)] ${
            isMoreActive || isMoreOpen ? "bg-red-600 text-white shadow-red" : "bg-white/[0.05] text-zinc-300"
          }`}
          onClick={onToggleMore}
          type="button"
        >
          <AdminBottomNavIcon name="more" />
          <span className="block max-w-full truncate whitespace-nowrap">More</span>
        </button>
      </nav>
    </>
  );
}

function AdminBottomNavIcon({ name }: { name: "dashboard" | "members" | "booking" | "payments" | "more" }) {
  const commonProps = {
    "aria-hidden": true,
    className: "size-[clamp(12px,3.7vw,15px)] shrink-0 sm:size-[clamp(13px,4vw,17px)]",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: "2",
    viewBox: "0 0 24 24"
  };

  if (name === "dashboard") {
    return (
      <svg {...commonProps}>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (name === "members") {
    return (
      <svg {...commonProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === "booking") {
    return (
      <svg {...commonProps}>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect height="18" rx="2" width="18" x="3" y="4" />
        <path d="M3 10h18" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    );
  }

  if (name === "payments") {
    return (
      <svg {...commonProps}>
        <rect height="14" rx="2" width="20" x="2" y="5" />
        <path d="M2 10h20" />
        <path d="M6 15h3" />
        <path d="M17 15h1" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M4 12h16" />
      <path d="M4 6h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function RevenueSection({ store }: { store: GymDataStore }) {
  const paidMembers = store.members.filter((member) => member.paymentStatus === "paid");
  const totalRevenue = paidMembers.reduce((total, member) => total + (member.feesAmount ?? getPlanPrice(member.selectedPlan)), 0);
  const currentMonth = today().slice(0, 7);
  const monthlyRevenue = store.payments
    .filter((payment) => payment.paymentStatus === "paid" && payment.paymentDate.startsWith(currentMonth))
    .reduce((total, payment) => total + payment.amount, 0);
  const planRevenue = planOptions.map((plan) => {
    const planMembers = paidMembers.filter((member) => member.selectedPlan === plan);
    return {
      members: planMembers.length,
      plan,
      revenue: planMembers.reduce((total, member) => total + (member.feesAmount ?? getPlanPrice(member.selectedPlan)), 0)
    };
  });

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111217]/95 p-4 shadow-card sm:rounded-[2rem] sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Revenue</p>
      <h2 className="mt-2 text-2xl font-black">Revenue from paid members</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-black uppercase tracking-wide text-zinc-400">Monthly Revenue</p>
          <h3 className="mt-2 text-2xl font-black text-red-400">{formatCurrency(monthlyRevenue)}</h3>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-black uppercase tracking-wide text-zinc-400">Total Revenue</p>
          <h3 className="mt-2 text-2xl font-black text-red-400">{formatCurrency(totalRevenue)}</h3>
        </article>
      </div>
      <div className="mt-5 grid gap-3">
        {planRevenue.map((item) => (
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={item.plan}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-black">{item.plan}</p>
              <p className="text-sm font-bold text-zinc-400">{item.members} paid members</p>
              <p className="font-black text-red-300">{formatCurrency(item.revenue)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Notifications({ items }: { items: string[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#111217]/95 p-5 shadow-card sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Notifications</p>
      <div className="mt-5 space-y-4">
        {items.map((item, index) => (
          <div className="flex gap-3" key={`${item}-${index}`}>
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-red-600/20 text-xs font-black text-red-200 ring-1 ring-red-500/35">{index + 1}</span>
            <p className="min-w-0 text-sm font-semibold leading-6 text-zinc-300">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsSection({ store }: { store: GymDataStore }) {
  const currentSettings = getGymSettings(store);
  const [adminEmail, setAdminEmail] = useState(currentSettings.adminEmail);
  const [gymName, setGymName] = useState(currentSettings.gymName);
  const [gymPhone, setGymPhone] = useState(currentSettings.gymPhoneNumber);
  const [whatsAppNumber, setWhatsAppNumber] = useState(currentSettings.whatsAppNumber);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const nextSettings = getGymSettings(store);
    setAdminEmail(nextSettings.adminEmail);
    setGymName(nextSettings.gymName);
    setGymPhone(nextSettings.gymPhoneNumber);
    setWhatsAppNumber(nextSettings.whatsAppNumber);
  }, [store]);

  function saveGymDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveGymSettings({
      adminEmail: adminEmail.trim(),
      gymName: gymName.trim(),
      gymPhoneNumber: gymPhone.trim(),
      whatsAppNumber: whatsAppNumber.trim()
    });
    setMessage("Gym details saved.");
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/change-password", {
      body: form,
      method: "POST"
    });
    setMessage(response.ok ? "Admin password updated." : "Password update failed.");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <ExportPanel store={store} />
      <article className="rounded-[2rem] border border-white/10 bg-[#111217]/95 p-5 shadow-card sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Settings</p>
        <h2 className="mt-2 text-2xl font-black">Admin profile</h2>
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-zinc-300">
          Admin Email: {adminEmail}
        </p>
      </article>

      <form className="rounded-[2rem] border border-white/10 bg-[#111217]/95 p-5 shadow-card sm:p-6" onSubmit={changePassword}>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Security</p>
        <h2 className="mt-2 text-2xl font-black">Change password</h2>
        <div className="mt-5 grid gap-4">
          <input className="contact-input" name="currentPassword" placeholder="Current password" required type="password" />
          <input className="contact-input" minLength={8} name="newPassword" placeholder="New password" required type="password" />
        </div>
        <button className="mt-5 rounded-full bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:bg-red-500" type="submit">
          Update Password
        </button>
      </form>

      <form className="rounded-[2rem] border border-white/10 bg-[#111217]/95 p-5 shadow-card sm:p-6 xl:col-span-2" onSubmit={saveGymDetails}>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Gym Details</p>
        <h2 className="mt-2 text-2xl font-black">Business information</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <input className="contact-input" onChange={(event) => setAdminEmail(event.target.value)} placeholder="Admin email" type="email" value={adminEmail} />
          <input className="contact-input" onChange={(event) => setGymName(event.target.value)} placeholder="Gym name" value={gymName} />
          <input className="contact-input" onChange={(event) => setGymPhone(event.target.value)} placeholder="Gym phone" value={gymPhone} />
          <input className="contact-input" onChange={(event) => setWhatsAppNumber(event.target.value)} placeholder="WhatsApp number" value={whatsAppNumber} />
        </div>
        <button className="mt-5 rounded-full bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:bg-red-500" type="submit">
          Save Details
        </button>
        {message ? <p className="mt-4 text-sm font-bold text-red-200">{message}</p> : null}
      </form>

    </section>
  );
}

function MemberEditor({ member, onClose }: { member: MemberData; onClose: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState(member.selectedPlan);
  const [startDate, setStartDate] = useState(member.membershipStartDate);
  const [endDate, setEndDate] = useState(member.membershipEndDate);
  const [feesAmount, setFeesAmount] = useState(String(member.feesAmount ?? getPlanPrice(member.selectedPlan)));
  const [profileImage, setProfileImage] = useState(member.profileImage || "");

  function updatePlan(plan: string) {
    setSelectedPlan(plan);
    setFeesAmount(String(getPlanPrice(plan)));
    setEndDate(addMonths(startDate, getPlanDurationMonths(plan)));
  }

  function updateStartDate(value: string) {
    setStartDate(value);
    setEndDate(addMonths(value, getPlanDurationMonths(selectedPlan)));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const submittedPlan = String(form.get("selectedPlan") || "Beginner Plan");
    const submittedStartDate = String(form.get("membershipStartDate") || today());

    saveMember({
      memberId: member.memberId,
      fullName: String(form.get("fullName") || ""),
      phoneNumber: String(form.get("phoneNumber") || ""),
      email: String(form.get("email") || ""),
      profileImage,
      selectedPlan: submittedPlan,
      membershipStartDate: submittedStartDate,
      membershipEndDate: String(form.get("membershipEndDate") || addMonths(submittedStartDate, getPlanDurationMonths(submittedPlan))),
      paymentStatus: String(form.get("paymentStatus") || "pending") as PaymentStatus,
      feesAmount: Number(form.get("feesAmount")) || getPlanPrice(submittedPlan),
      notes: String(form.get("notes") || ""),
      age: member.age,
      gender: member.gender,
      joiningDate: member.joiningDate,
      membershipStatus: "active"
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
      <form className="my-6 w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#111217] p-6 shadow-card" onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Member Editor</p>
            <h2 className="mt-2 text-2xl font-black">{member.memberId ? "Edit Member" : "Add Member"}</h2>
          </div>
          <button className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-xl font-bold transition hover:bg-red-600" onClick={onClose} type="button">x</button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <input className="contact-input" defaultValue={member.fullName} name="fullName" placeholder="Name" required />
          <input className="contact-input" defaultValue={member.phoneNumber} name="phoneNumber" placeholder="Phone" required />
          <input className="contact-input" defaultValue={member.email} name="email" placeholder="Email" required type="email" />
          <label className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">Profile image</span>
            <span className="mt-3 flex items-center gap-4">
              {profileImage ? <img alt="" className="size-16 rounded-2xl object-cover ring-1 ring-red-500/35" decoding="async" loading="lazy" src={profileImage} /> : <span className="grid size-16 place-items-center rounded-2xl bg-red-600/20 text-sm font-black text-red-100 ring-1 ring-red-500/35">PH</span>}
              <input
                accept="image/*"
                className="min-w-0 text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-wide file:text-white"
                onChange={(event) => readProfileImage(event.currentTarget.files?.[0], setProfileImage)}
                type="file"
              />
            </span>
          </label>
          <select className="contact-input" name="selectedPlan" onChange={(event) => updatePlan(event.target.value)} value={selectedPlan}>{planOptions.map((plan) => <option key={plan}>{plan}</option>)}</select>
          <input className="contact-input" name="membershipStartDate" onChange={(event) => updateStartDate(event.target.value)} type="date" value={startDate} required />
          <input className="contact-input" name="membershipEndDate" onChange={(event) => setEndDate(event.target.value)} type="date" value={endDate} required />
          <select className="contact-input" defaultValue={member.paymentStatus} name="paymentStatus">{paymentOptions.map((status) => <option key={status} value={status}>{formatPaymentStatus(status)}</option>)}</select>
          <input className="contact-input" name="feesAmount" onChange={(event) => setFeesAmount(event.target.value)} placeholder="Fees amount" type="number" value={feesAmount} />
          <textarea className="contact-input min-h-24 resize-y sm:col-span-2" defaultValue={member.notes || ""} name="notes" placeholder="Notes" />
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button className="rounded-full bg-red-600 px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:bg-red-500" type="submit">Save Member</button>
          <button className="rounded-full border border-white/15 px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:border-red-400" onClick={onClose} type="button">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function RenewMemberModal({ member, onClose }: { member: MemberData; onClose: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState(member.selectedPlan || "Beginner Plan");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(addMonths(today(), getPlanDurationMonths(member.selectedPlan || "Beginner Plan")));
  const [feesAmount, setFeesAmount] = useState(String(getPlanPrice(member.selectedPlan || "Beginner Plan")));

  function updatePlan(plan: string) {
    setSelectedPlan(plan);
    setFeesAmount(String(getPlanPrice(plan)));
    setEndDate(addMonths(startDate, getPlanDurationMonths(plan)));
  }

  function updateStartDate(value: string) {
    setStartDate(value);
    setEndDate(addMonths(value, getPlanDurationMonths(selectedPlan)));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    saveMember({
      ...member,
      selectedPlan,
      membershipStartDate: startDate,
      membershipEndDate: endDate,
      paymentStatus: String(form.get("paymentStatus") || "pending") as PaymentStatus,
      feesAmount: Number(form.get("feesAmount")) || getPlanPrice(selectedPlan),
      notes: String(form.get("notes") || member.notes || ""),
      membershipStatus: "active"
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
      <form className="my-6 w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#111217] p-6 shadow-card" onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Renew Membership</p>
            <h2 className="mt-2 text-2xl font-black">{member.fullName}</h2>
          </div>
          <button className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-xl font-bold transition hover:bg-red-600" onClick={onClose} type="button">x</button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <select className="contact-input" onChange={(event) => updatePlan(event.target.value)} value={selectedPlan}>
            {planOptions.map((plan) => <option key={plan}>{plan}</option>)}
          </select>
          <select className="contact-input" defaultValue="pending" name="paymentStatus">
            {paymentOptions.map((status) => <option key={status} value={status}>{formatPaymentStatus(status)}</option>)}
          </select>
          <input className="contact-input" onChange={(event) => updateStartDate(event.target.value)} type="date" value={startDate} />
          <input className="contact-input" onChange={(event) => setEndDate(event.target.value)} type="date" value={endDate} />
          <input className="contact-input" name="feesAmount" onChange={(event) => setFeesAmount(event.target.value)} type="number" value={feesAmount} />
          <input className="contact-input" defaultValue={member.notes || ""} name="notes" placeholder="Notes" />
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button className="rounded-full bg-red-600 px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:bg-red-500" type="submit">Renew Member</button>
          <button className="rounded-full border border-white/15 px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:border-red-400" onClick={onClose} type="button">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function getStats(store: GymDataStore, activeMembers: MemberData[], expiredMembers: MemberData[]) {
  const paidMembers = activeMembers.filter((member) => member.paymentStatus === "paid");
  const pendingMembers = activeMembers.filter((member) => member.paymentStatus !== "paid");
  const revenue = sumPlanValue(paidMembers);

  return [
    { label: "Total Members", value: String(store.members.length), note: "Complete member history" },
    { label: "Active Members", value: String(activeMembers.length), note: "Currently valid memberships" },
    { label: "Expired Members", value: String(expiredMembers.length), note: "History retained" },
    { label: "Pending Fees", value: String(pendingMembers.length), note: "Needs follow-up" },
    { label: "Revenue", value: formatCurrency(revenue), note: "From paid active plans" }
  ];
}

function getNotifications(store: GymDataStore, expiredMembers: MemberData[]) {
  const expiringMembers = store.members.filter((member) => {
    const end = new Date(`${member.membershipEndDate}T23:59:59`);
    if (Number.isNaN(end.getTime())) return false;
    const days = Math.ceil((end.getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 7;
  });
  const items = [
    ...store.bookings.slice(0, 6).map((booking) => {
      const contact = getBookingContact(booking, store);
      return `New Booking | ${booking.userName} | ${booking.selectedPlan} | ${contact.phoneNumber} | ${formatNotificationDate(booking.bookingDate)}`;
    }),
    ...expiringMembers.map((member) => {
      const days = Math.max(0, Math.ceil((new Date(`${member.membershipEndDate}T23:59:59`).getTime() - Date.now()) / 86400000));
      return `Membership Expiring | ${member.fullName} | ${days} days left`;
    }),
    ...expiredMembers.map((member) => `Membership Expired | ${member.fullName} | ${formatGymDate(member.membershipEndDate)}`),
    ...store.members
      .filter((member) => member.paymentStatus !== "paid")
      .map((member) => `Payment Pending | ${member.fullName} | ${formatCurrency(member.feesAmount ?? getPlanPrice(member.selectedPlan))} | ${formatNotificationDate(member.joiningDate || member.membershipStartDate)}`)
  ];

  return items.length ? items : ["No notifications right now."];
}

function getBookingContact(booking: GymDataStore["bookings"][number], store: GymDataStore) {
  const linkedMember =
    store.members.find((member) => member.fullName === booking.userName && member.selectedPlan === booking.selectedPlan) ||
    store.members.find((member) => member.fullName === booking.userName);
  const linkedPayment = store.payments.find((payment) => payment.bookingId === booking.bookingId);

  return {
    email: booking.email || linkedMember?.email || "Not saved",
    feesAmount: booking.feesAmount ?? linkedMember?.feesAmount ?? getPlanPrice(booking.selectedPlan),
    paymentMethod: booking.paymentMethod || linkedPayment?.paymentMethod || "cash",
    paymentStatus: booking.paymentStatus || linkedPayment?.paymentStatus || linkedMember?.paymentStatus || "pending",
    phoneNumber: booking.phoneNumber || linkedMember?.phoneNumber || "Not saved"
  };
}

function getRelativeDate(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function formatNotificationDate(date: string) {
  if (date === today()) return "Today";
  if (date === getRelativeDate(-1)) return "Yesterday";
  return formatGymDate(date);
}

function isActiveMember(member: MemberData) {
  const end = new Date(`${member.membershipEndDate}T23:59:59`);
  if (Number.isNaN(end.getTime())) return false;
  return end.getTime() >= Date.now() && member.membershipStatus !== "expired";
}

function createBlankMember(): MemberData {
  const startDate = today();
  return {
    memberId: "",
    fullName: "",
    phoneNumber: "",
    email: "",
    profileImage: "",
    age: 0,
    gender: "Not specified",
    selectedPlan: "Beginner Plan",
    joiningDate: startDate,
    membershipStartDate: startDate,
    membershipEndDate: addMonths(startDate, 1),
    membershipStatus: "active",
    paymentStatus: "pending",
    feesAmount: getPlanPrice("Beginner Plan"),
    notes: ""
  };
}

function sumPlanValue(members: MemberData[]) {
  return members.reduce((total, member) => total + (member.feesAmount ?? getPlanPrice(member.selectedPlan)), 0);
}

function readProfileImage(file: File | undefined, onLoad: (value: string) => void) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => onLoad(String(reader.result || ""));
  reader.readAsDataURL(file);
}

function buildMemberWhatsAppHref(member: MemberData) {
  const digits = member.phoneNumber.replace(/\D/g, "");
  const phone = digits.length === 10 ? `91${digits}` : digits;
  const message = `Hello ${member.fullName}, this is CORE X FITNESS regarding your ${member.selectedPlan} membership.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function exportMembers(members: MemberData[]) {
  saveInternalExport(
    "core-x-fitness-members.csv",
    ["First Name", "Phone Number", "Email", "Selected Plan", "Join Date", "Membership End Date", "Payment Status"],
    members.map((member) => [
      member.fullName,
      member.phoneNumber,
      member.email,
      member.selectedPlan,
      member.membershipStartDate,
      member.membershipEndDate,
      member.paymentStatus
    ])
  );
}

function exportPayments(payments: GymDataStore["payments"]) {
  saveInternalExport(
    "core-x-fitness-payments.csv",
    ["Payment ID", "Member Name", "Amount", "Method", "Status", "Payment Date"],
    payments.map((payment) => [
      payment.paymentId,
      payment.memberName,
      String(payment.amount),
      payment.paymentMethod,
      payment.paymentStatus,
      payment.paymentDate
    ])
  );
}

function exportBookings(store: GymDataStore) {
  saveInternalExport(
    "core-x-fitness-bookings.csv",
    ["Booking ID", "User Name", "Phone", "Email", "Selected Plan", "Booking Date", "Booking Time", "Payment Method", "Payment Status", "Status"],
    store.bookings.map((booking) => {
      const contact = getBookingContact(booking, store);
      return [
        booking.bookingId,
        booking.userName,
        contact.phoneNumber,
        contact.email,
        booking.selectedPlan,
        booking.bookingDate,
        booking.bookingTime || "",
        formatPaymentMethod(contact.paymentMethod),
        formatBookingPaymentStatus(contact.paymentStatus, contact.paymentMethod),
        booking.bookingStatus
      ];
    })
  );
}

function saveInternalExport(fileName: string, headers: string[], rows: string[][]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    "core-x-fitness:last-export",
    JSON.stringify({
      fileName,
      headers,
      rows,
      savedAt: new Date().toISOString()
    })
  );
}

function formatPaymentStatus(status: PaymentStatus | string) {
  if (status === "cash_on_gym") return "Cash on Gym";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatPaymentMethod(method?: string) {
  if (method === "cash") return "Cash on Gym";
  if (method === "google_pay") return "Google Pay";
  if (method === "phonepe") return "PhonePe";
  if (method === "paytm") return "Paytm";
  if (method === "upi") return "UPI";
  if (method === "card") return "Card";
  if (method === "bank_transfer") return "Bank Transfer";
  return "Not Selected";
}

function formatBookingPaymentStatus(status: PaymentStatus | string, method?: string) {
  if ((method === "cash" && status === "pending") || status === "cash_on_gym") {
    return "Pending Cash Payment";
  }

  return formatPaymentStatus(status);
}

function formatSelectOption(option: string) {
  return paymentOptions.includes(option as PaymentStatus) ? formatPaymentStatus(option) : option;
}

function BellIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}
