import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import type { BookingData, BookingStatus, GymDataStore, MemberData, PaymentData, PaymentStatus } from "@/lib/gym-data-models";
import { addMonths, createId, getPlanPrice, today } from "@/lib/gym-management-store";
import { getGymDataStore, saveGymDataStore } from "@/lib/gym-server-store";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getGymDataStore());
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = (await request.json()) as GymDataStore;
  return NextResponse.json(await saveGymDataStore(store));
}

export async function POST(request: Request) {
  const payload = (await request.json()) as PublicGymDataPayload;
  const eventType = getPublicEventType(payload);

  if (eventType === "booking") {
    const bookingPayload = normalizeBookingPayload(payload as Extract<PublicGymDataEvent, { type: "booking" }>);
    const missingFields = getMissingBookingFields(bookingPayload);

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required booking fields: ${missingFields.join(", ")}` }, { status: 400 });
    }

    return NextResponse.json(await addPublicBooking(bookingPayload));
  }

  if (eventType === "bookingRecord") {
    return NextResponse.json(await addPublicBookingRecord(payload as Extract<PublicGymDataEvent, { type: "bookingRecord" }>));
  }

  if (eventType === "contactLead") {
    return NextResponse.json(await addPublicContactLead(payload as Extract<PublicGymDataEvent, { type: "contactLead" }>));
  }

  if (eventType === "whatsAppLead") {
    return NextResponse.json(await addPublicWhatsAppLead(payload as Extract<PublicGymDataEvent, { type: "whatsAppLead" }>));
  }

  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await saveGymDataStore(payload as GymDataStore));
}

type PublicGymDataPayload = PublicGymDataEvent | GymDataStore;

type PublicGymDataEvent =
  | {
      type: "booking";
      fullName: string;
      phone: string;
      phoneNumber?: string;
      email: string;
      age: string;
      gender: string;
      joiningDate: string;
      selectedPlan: string;
      feesAmount?: number;
      bookingStatus?: BookingStatus;
      paymentStatus?: PaymentStatus;
    }
  | {
      type: "bookingRecord";
      booking: BookingData;
      member: MemberData;
      payment: PaymentData;
    }
  | {
      type: "contactLead";
      email?: string;
      name: string;
      phone: string;
      subject?: string;
      message: string;
    }
  | {
      type: "whatsAppLead";
      userName: string;
      phoneNumber: string;
      planSelected: string;
      message: string;
    };

async function addPublicBooking(payload: Extract<PublicGymDataPayload, { type: "booking" }>) {
  const store = await getGymDataStore();
  const startDate = payload.joiningDate || today();
  const endDate = addMonths(startDate, getPlanDurationMonths(payload.selectedPlan));
  const memberId = createId("CXF");
  const bookingDate = today();
  const bookingTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const paymentStatus = "pending" as const;
  const paymentMethod = "cash" as const;
  const feesAmount = typeof payload.feesAmount === "number" ? payload.feesAmount : getPlanPrice(payload.selectedPlan);

  const member = {
    memberId,
    fullName: payload.fullName.trim(),
    phoneNumber: payload.phone.trim(),
    email: payload.email.trim(),
    profileImage: "",
    age: Number(payload.age) || 0,
    gender: payload.gender,
    selectedPlan: payload.selectedPlan,
    joiningDate: startDate,
    membershipStartDate: startDate,
    membershipEndDate: endDate,
    membershipStatus: "active" as const,
    paymentStatus,
    feesAmount,
    notes: "Created from plan booking"
  };

  const booking = {
    bookingId: createId("BOOK"),
    userName: member.fullName,
    phoneNumber: member.phoneNumber,
    email: member.email,
    selectedPlan: member.selectedPlan,
    bookingDate,
    bookingTime,
    bookingStatus: payload.bookingStatus || ("submitted" as const),
    paymentMethod,
    paymentStatus,
    feesAmount
  };

  const payment = {
    paymentId: createId("PAY"),
    bookingId: booking.bookingId,
    memberName: member.fullName,
    amount: feesAmount,
    paymentMethod,
    paymentStatus,
    paymentDate: bookingDate,
    paymentNumber: "8709304727",
    transactionNote: "Pending Cash Payment"
  };

  await saveGymDataStore({
    ...store,
    bookings: [booking, ...store.bookings],
    members: [member, ...store.members.filter((current) => current.memberId !== member.memberId)],
    payments: [payment, ...store.payments]
  });

  return { booking, member, payment };
}

async function addPublicBookingRecord(payload: Extract<PublicGymDataPayload, { type: "bookingRecord" }>) {
  const store = await getGymDataStore();

  await saveGymDataStore({
    ...store,
    bookings: [payload.booking, ...store.bookings.filter((booking) => booking.bookingId !== payload.booking.bookingId)],
    members: [payload.member, ...store.members.filter((member) => member.memberId !== payload.member.memberId)],
    payments: [payload.payment, ...store.payments.filter((payment) => payment.paymentId !== payload.payment.paymentId)]
  });

  return payload;
}

async function addPublicContactLead(payload: Extract<PublicGymDataPayload, { type: "contactLead" }>) {
  const store = await getGymDataStore();
  const lead = {
    contactDate: today(),
    email: payload.email,
    message: payload.message,
    name: payload.name,
    phone: payload.phone,
    subject: payload.subject
  };

  await saveGymDataStore({
    ...store,
    contactLeads: [lead, ...store.contactLeads]
  });

  return lead;
}

async function addPublicWhatsAppLead(payload: Extract<PublicGymDataPayload, { type: "whatsAppLead" }>) {
  const store = await getGymDataStore();
  const lead = {
    date: today(),
    message: payload.message,
    phoneNumber: payload.phoneNumber,
    planSelected: payload.planSelected,
    userName: payload.userName
  };

  await saveGymDataStore({
    ...store,
    whatsAppLeads: [lead, ...store.whatsAppLeads]
  });

  return lead;
}

function getPublicEventType(payload: PublicGymDataPayload) {
  if (payload && typeof payload === "object" && "type" in payload && typeof payload.type === "string") {
    return payload.type;
  }

  return undefined;
}

function normalizeBookingPayload(payload: Extract<PublicGymDataEvent, { type: "booking" }>) {
  return {
    ...payload,
    phone: payload.phone || payload.phoneNumber || "",
    age: payload.age || "",
    gender: payload.gender || "",
    joiningDate: payload.joiningDate || today()
  };
}

function getMissingBookingFields(payload: Extract<PublicGymDataEvent, { type: "booking" }>) {
  return [
    ["fullName", payload.fullName],
    ["phone", payload.phone],
    ["email", payload.email],
    ["selectedPlan", payload.selectedPlan]
  ]
    .filter(([, value]) => typeof value !== "string" || value.trim().length === 0)
    .map(([field]) => field);
}

function getPlanDurationMonths(plan: string) {
  if (plan === "Standard Plan") return 3;
  if (plan === "Premium Plan") return 6;
  return 1;
}
