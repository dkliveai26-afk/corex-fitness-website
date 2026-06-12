import type {
  BookingData,
  BookingStatus,
  ContactLeadData,
  GymDataStore,
  GymSettingsData,
  MemberData,
  PaymentData,
  PaymentStatus,
  WhatsAppLeadData
} from "@/lib/gym-data-models";

const storeKey = "power-house-fitness:gym-management-store";
const changeEventName = "power-house-fitness:gym-management-store-change";
const apiPath = "/api/gym-data";

const planPrices: Record<string, number> = {
  "Beginner Plan": 1600,
  "Standard Plan": 1999,
  "Premium Plan": 3999
};

const planDurations: Record<string, number> = {
  "Beginner Plan": 1,
  "Standard Plan": 3,
  "Premium Plan": 6
};

const seedStore: GymDataStore = {
  members: [],
  bookings: [],
  payments: [],
  contactLeads: [],
  whatsAppLeads: [],
  settings: undefined
};

export type BookingMemberInput = {
  fullName: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  joiningDate: string;
  selectedPlan: string;
  feesAmount?: number;
  bookingStatus?: BookingStatus;
  paymentStatus?: PaymentStatus;
};

export type MemberFormInput = {
  memberId?: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  profileImage?: string;
  age?: number;
  gender?: string;
  selectedPlan: string;
  joiningDate?: string;
  membershipStartDate: string;
  membershipEndDate: string;
  membershipStatus?: MemberData["membershipStatus"];
  paymentStatus: PaymentStatus;
  feesAmount?: number;
  notes?: string;
};

export function loadGymDataStore(): GymDataStore {
  if (typeof window === "undefined") return seedStore;

  const saved = window.localStorage.getItem(storeKey);

  if (!saved) {
    return seedStore;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<GymDataStore>;
    return normalizeStore(parsed);
  } catch {
    return seedStore;
  }
}

export function saveGymDataStore(store: GymDataStore) {
  if (typeof window === "undefined") return;

  const normalizedStore = normalizeStore(store);
  window.localStorage.setItem(storeKey, JSON.stringify(normalizedStore));
  window.dispatchEvent(new Event(changeEventName));
  void saveGymDataStoreToServer(normalizedStore);
}

export async function syncGymDataStoreFromServer() {
  if (typeof window === "undefined") return seedStore;

  try {
    const response = await fetch(apiPath, { cache: "no-store" });
    if (!response.ok) return loadGymDataStore();

    const store = normalizeStore((await response.json()) as Partial<GymDataStore>);
    window.localStorage.setItem(storeKey, JSON.stringify(store));
    window.dispatchEvent(new Event(changeEventName));
    return store;
  } catch {
    return loadGymDataStore();
  }
}

async function saveGymDataStoreToServer(store: GymDataStore) {
  const payload = JSON.stringify(store);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const queued = navigator.sendBeacon(apiPath, new Blob([payload], { type: "application/json" }));
    if (queued) return;
  }

  try {
    await fetch(apiPath, {
      body: payload,
      headers: { "Content-Type": "application/json" },
      method: "PUT"
    });
  } catch {
    // Keep local data available if the server is temporarily unreachable.
  }
}

async function savePublicGymDataEvent(payload: unknown) {
  void savePublicFirebaseEvent(payload);
  const serializedPayload = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const queued = navigator.sendBeacon(apiPath, new Blob([serializedPayload], { type: "application/json" }));
    if (queued) return;
  }

  try {
    await fetch(apiPath, {
      body: serializedPayload,
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
  } catch {
    // Keep the local flow working if the network is temporarily unavailable.
  }
}

async function savePublicFirebaseEvent(payload: unknown) {
  if (typeof window === "undefined") return;

  try {
    const { saveFirebasePublicEvent } = await import("@/lib/firebase-client-writes");
    await saveFirebasePublicEvent(payload);
  } catch {
    // Firebase writes are mirrored; local/API storage keeps the user flow working if rules are not ready yet.
  }
}

export function subscribeGymDataStore(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;

  window.addEventListener(changeEventName, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(changeEventName, listener);
    window.removeEventListener("storage", listener);
  };
}

export function addBookingMember(input: BookingMemberInput) {
  const store = loadGymDataStore();
  const startDate = input.joiningDate || today();
  const endDate = addMonths(startDate, planDurations[input.selectedPlan] || 1);
  const memberId = createId("CXF");
  const bookingDate = today();
  const bookingTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const paymentMethod = "cash" as const;
  const paymentStatus: PaymentStatus = "pending";
  const feesAmount = typeof input.feesAmount === "number" ? input.feesAmount : getPlanPrice(input.selectedPlan);

  const member: MemberData = {
    memberId,
    fullName: input.fullName.trim(),
    phoneNumber: input.phone.trim(),
    email: input.email.trim(),
    profileImage: "",
    age: Number(input.age) || 0,
    gender: input.gender,
    selectedPlan: input.selectedPlan,
    joiningDate: startDate,
    membershipStartDate: startDate,
    membershipEndDate: endDate,
    membershipStatus: "active",
    paymentStatus,
    feesAmount,
    notes: "Created from plan booking"
  };

  const booking: BookingData = {
    bookingId: createId("BOOK"),
    userName: member.fullName,
    phoneNumber: member.phoneNumber,
    email: member.email,
    selectedPlan: member.selectedPlan,
    bookingDate,
    bookingTime,
    bookingStatus: input.bookingStatus || "submitted",
    paymentMethod,
    paymentStatus: member.paymentStatus,
    feesAmount
  };

  const payment: PaymentData = {
    paymentId: createId("PAY"),
    bookingId: booking.bookingId,
    memberName: member.fullName,
    amount: feesAmount,
    paymentMethod,
    paymentStatus: member.paymentStatus,
    paymentDate: bookingDate,
    paymentNumber: "8709304727",
    transactionNote: "Pending Cash Payment"
  };

  saveGymDataStore({
    ...store,
    members: upsertById(store.members, member, "memberId"),
    bookings: [booking, ...store.bookings],
    payments: [payment, ...store.payments]
  });
  void savePublicGymDataEvent({ type: "bookingRecord", booking, member, payment });

  return { booking, member, payment };
}

export function saveMember(input: MemberFormInput) {
  const store = loadGymDataStore();
  const startDate = input.membershipStartDate || input.joiningDate || today();
  const existingMember = input.memberId ? store.members.find((member) => member.memberId === input.memberId) : undefined;
  const member: MemberData = {
    memberId: input.memberId || createId("CXF"),
    fullName: input.fullName.trim(),
    phoneNumber: input.phoneNumber.trim(),
    email: input.email.trim(),
    profileImage: input.profileImage || "",
    age: input.age || 0,
    gender: input.gender || "Not specified",
    selectedPlan: input.selectedPlan,
    joiningDate: input.joiningDate || startDate,
    membershipStartDate: startDate,
    membershipEndDate: input.membershipEndDate || addMonths(startDate, planDurations[input.selectedPlan] || 1),
    membershipStatus: input.membershipStatus || "active",
    paymentStatus: input.paymentStatus,
    feesAmount: typeof input.feesAmount === "number" ? input.feesAmount : getPlanPrice(input.selectedPlan),
    notes: input.notes || ""
  };
  const shouldRecordPayment =
    !existingMember ||
    existingMember.paymentStatus !== member.paymentStatus ||
    existingMember.feesAmount !== member.feesAmount ||
    existingMember.selectedPlan !== member.selectedPlan;
  const payment: PaymentData = {
    paymentId: createId("PAY"),
    memberName: member.fullName,
    amount: member.feesAmount ?? getPlanPrice(member.selectedPlan),
    paymentMethod: "cash",
    paymentStatus: member.paymentStatus,
    paymentDate: today()
  };

  saveGymDataStore({
    ...store,
    members: upsertById(store.members, member, "memberId"),
    payments: shouldRecordPayment ? [payment, ...store.payments] : store.payments
  });
  void savePublicFirebaseEvent({ type: "memberRecord", member, payment: shouldRecordPayment ? payment : undefined });

  return member;
}

export function updateBookingStatus(bookingId: string, bookingStatus: BookingStatus) {
  const store = loadGymDataStore();

  saveGymDataStore({
    ...store,
    bookings: store.bookings.map((booking) => (booking.bookingId === bookingId ? { ...booking, bookingStatus } : booking))
  });
}

export function deleteMember(memberId: string) {
  const store = loadGymDataStore();
  saveGymDataStore({
    ...store,
    members: store.members.filter((member) => member.memberId !== memberId)
  });
}

export function addContactLead(lead: Omit<ContactLeadData, "contactDate">) {
  const store = loadGymDataStore();
  saveGymDataStore({
    ...store,
    contactLeads: [{ ...lead, contactDate: today() }, ...store.contactLeads]
  });
  void savePublicGymDataEvent({ type: "contactLead", ...lead });
}

export function addWhatsAppLead(lead: Omit<WhatsAppLeadData, "date">) {
  const store = loadGymDataStore();
  saveGymDataStore({
    ...store,
    whatsAppLeads: [{ ...lead, date: today() }, ...store.whatsAppLeads]
  });
  void savePublicGymDataEvent({ type: "whatsAppLead", ...lead });
}

export function getPlanPrice(plan: string) {
  return planPrices[plan] || 0;
}

export function getPlanDurationMonths(plan: string) {
  return planDurations[plan] || 1;
}

export function getRemainingDays(endDate: string) {
  const end = new Date(`${endDate}T23:59:59`);
  if (Number.isNaN(end.getTime())) return 0;

  const difference = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(difference / 86400000));
}

export function formatGymDate(date: string) {
  if (!date) return "Not set";

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(amount);
}

export function createId(prefix: string) {
  return `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function addMonths(date: string, months: number) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  parsed.setMonth(parsed.getMonth() + months);
  return parsed.toISOString().slice(0, 10);
}

function normalizeStore(store: Partial<GymDataStore>): GymDataStore {
  const members = Array.isArray(store.members) ? store.members : seedStore.members;
  const bookings = Array.isArray(store.bookings)
    ? store.bookings.map((booking) => {
        const linkedMember =
          members.find((member) => member.fullName === booking.userName && member.selectedPlan === booking.selectedPlan) ||
          members.find((member) => member.fullName === booking.userName);

        return {
          ...booking,
          email: booking.email || linkedMember?.email || "",
          feesAmount: booking.feesAmount ?? linkedMember?.feesAmount ?? getPlanPrice(booking.selectedPlan),
          paymentMethod: booking.paymentMethod || "cash",
          paymentStatus: booking.paymentStatus || linkedMember?.paymentStatus || "pending",
          phoneNumber: booking.phoneNumber || linkedMember?.phoneNumber || ""
        };
      })
    : seedStore.bookings;

  return {
    members,
    bookings,
    payments: Array.isArray(store.payments) ? store.payments : seedStore.payments,
    contactLeads: Array.isArray(store.contactLeads) ? store.contactLeads : [],
    whatsAppLeads: Array.isArray(store.whatsAppLeads) ? store.whatsAppLeads : [],
    gymSheetRows: Array.isArray(store.gymSheetRows) ? store.gymSheetRows : [],
    settings: store.settings
  };
}

export function saveGymSettings(settings: GymSettingsData) {
  const store = loadGymDataStore();
  saveGymDataStore({
    ...store,
    settings
  });
}

export function getGymSettings(store?: GymDataStore): GymSettingsData {
  return {
    adminEmail: store?.settings?.adminEmail || "focusjournal786@gmail.com",
    gymName: store?.settings?.gymName || "CORE X FITNESS",
    gymPhoneNumber: store?.settings?.gymPhoneNumber || "8709304727",
    whatsAppNumber: store?.settings?.whatsAppNumber || "8709304727"
  };
}

function upsertById<T, K extends keyof T>(items: T[], item: T, key: K) {
  const exists = items.some((current) => current[key] === item[key]);
  if (!exists) return [item, ...items];

  return items.map((current) => (current[key] === item[key] ? item : current));
}
