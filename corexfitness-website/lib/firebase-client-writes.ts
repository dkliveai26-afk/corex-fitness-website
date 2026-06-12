"use client";

import { doc, setDoc } from "firebase/firestore";
import { trainers } from "@/components/trainers/trainer-data";
import { bootFirebaseClient, firebaseAuth, firebaseDb } from "@/lib/firebase-client";
import { createId } from "@/lib/gym-management-store";

const planDocuments = [
  {
    durationMonths: 1,
    features: ["Gym Access", "Cardio Access", "Basic Support", "Locker Access", "Fitness Assessment"],
    name: "Beginner Plan",
    price: 1600
  },
  {
    durationMonths: 3,
    features: ["Gym Access", "Cardio Access", "Weight Training", "Trainer Support", "Diet Guidance"],
    name: "Standard Plan",
    price: 1999
  },
  {
    durationMonths: 6,
    features: ["Gym Access", "Cardio Access", "Weight Training", "Personal Trainer", "Diet Guidance"],
    name: "Premium Plan",
    price: 3999
  }
];

export async function seedFirebasePublicCollections() {
  await bootFirebaseClient();
  const updatedAt = new Date().toISOString();

  await Promise.all([
    ...planDocuments.map((plan) =>
      setDoc(doc(firebaseDb, "plans", slugify(plan.name)), withMeta(plan, updatedAt), {
        merge: true
      })
    ),
    ...trainers.map((trainer) =>
      setDoc(doc(firebaseDb, "trainers", trainer.slug), withMeta(trainer, updatedAt), {
        merge: true
      })
    )
  ]);
}

export async function saveFirebasePublicEvent(payload: unknown) {
  await bootFirebaseClient();
  const updatedAt = new Date().toISOString();
  const userId = firebaseAuth.currentUser?.uid || "anonymous";

  if (isBookingRecord(payload)) {
    await Promise.all([
      setDoc(doc(firebaseDb, "users", payload.member.memberId), withMeta(payload.member, updatedAt, userId, "member"), {
        merge: true
      }),
      setDoc(doc(firebaseDb, "bookings", payload.booking.bookingId), withMeta(payload.booking, updatedAt, userId, "booking"), {
        merge: true
      }),
      setDoc(doc(firebaseDb, "payments", payload.payment.paymentId), withMeta(payload.payment, updatedAt, userId, "payment"), {
        merge: true
      })
    ]);
    return;
  }

  if (isMemberRecord(payload)) {
    await Promise.all([
      setDoc(doc(firebaseDb, "users", payload.member.memberId), withMeta(payload.member, updatedAt, userId, "member"), {
        merge: true
      }),
      payload.payment
        ? setDoc(doc(firebaseDb, "payments", payload.payment.paymentId), withMeta(payload.payment, updatedAt, userId, "payment"), {
            merge: true
          })
        : Promise.resolve()
    ]);
    return;
  }

  if (isContactLead(payload)) {
    await setDoc(doc(firebaseDb, "contacts", createId("CONTACT")), withMeta(payload, updatedAt, userId, "contactLead"), {
      merge: true
    });
    return;
  }

  if (isWhatsAppLead(payload)) {
    await setDoc(doc(firebaseDb, "contacts", createId("WA")), withMeta(payload, updatedAt, userId, "whatsAppLead"), {
      merge: true
    });
    return;
  }

}

function isBookingRecord(payload: unknown): payload is {
  booking: { bookingId: string };
  member: { memberId: string };
  payment: { paymentId: string };
  type: "bookingRecord";
} {
  return Boolean(payload && typeof payload === "object" && "type" in payload && (payload as { type?: string }).type === "bookingRecord");
}

function isMemberRecord(payload: unknown): payload is {
  member: { memberId: string };
  payment?: { paymentId: string };
  type: "memberRecord";
} {
  return Boolean(payload && typeof payload === "object" && "type" in payload && (payload as { type?: string }).type === "memberRecord");
}

function isContactLead(payload: unknown): payload is { type: "contactLead" } {
  return Boolean(payload && typeof payload === "object" && "type" in payload && (payload as { type?: string }).type === "contactLead");
}

function isWhatsAppLead(payload: unknown): payload is { type: "whatsAppLead" } {
  return Boolean(payload && typeof payload === "object" && "type" in payload && (payload as { type?: string }).type === "whatsAppLead");
}

function withMeta<T>(record: T, updatedAt: string, userId?: string, recordType?: string) {
  return {
    ...record,
    firebaseUserId: userId,
    recordType,
    updatedAt
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
