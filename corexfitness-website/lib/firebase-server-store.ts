import { createHash } from "node:crypto";
import { getApp, getApps, initializeApp } from "firebase/app";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, setDoc } from "firebase/firestore/lite";
import { trainers } from "@/components/trainers/trainer-data";
import { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase-config";
import type { GymDataStore } from "@/lib/gym-data-models";

const aggregateCollection = "gymManagementData";
const aggregateDocument = "main";

const planDocuments = [
  {
    durationMonths: 1,
    features: ["Gym Access", "Cardio Access", "Basic Support", "Locker Access", "Fitness Assessment"],
    name: "Beginner Plan",
    price: 999
  },
  {
    durationMonths: 3,
    features: ["Gym Access", "Cardio Access", "Weight Training", "Trainer Support", "Diet Guidance"],
    name: "Standard Plan",
    price: 2499
  },
  {
    durationMonths: 6,
    features: ["Gym Access", "Cardio Access", "Weight Training", "Personal Trainer", "Diet Guidance"],
    name: "Premium Plan",
    price: 4999
  }
];

function getFirebaseDb() {
  if (!isFirebaseConfigured()) return null;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}

export async function getFirebaseGymDataStore() {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const snapshot = await getDoc(doc(db, aggregateCollection, aggregateDocument));
    if (!snapshot.exists()) return null;

    return snapshot.data().store as Partial<GymDataStore>;
  } catch {
    return null;
  }
}

export async function saveFirebaseGymDataStore(store: GymDataStore) {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const updatedAt = new Date().toISOString();
    await setDoc(
      doc(db, aggregateCollection, aggregateDocument),
      {
        store,
        updatedAt
      },
      { merge: true }
    );

    await Promise.all([
      syncCollectionExact(
        "users",
        store.members,
        (member) => member.memberId,
        (member) => ({ ...member, recordType: "member", updatedAt }),
        (existingDoc) => existingDoc.data().recordType === "member"
      ),
      syncCollectionExact(
        "bookings",
        store.bookings,
        (booking) => booking.bookingId,
        (booking) => ({ ...booking, updatedAt })
      ),
      syncCollectionExact(
        "payments",
        store.payments,
        (payment) => payment.paymentId,
        (payment) => ({ ...payment, updatedAt })
      ),
      syncCollectionExact(
        "contacts",
        [
          ...store.contactLeads.map((lead) => ({ ...lead, source: "contactForm" })),
          ...store.whatsAppLeads.map((lead) => ({ ...lead, source: "whatsApp" }))
        ],
        (lead) => createStableId(lead),
        (lead) => ({ ...lead, recordType: lead.source === "contactForm" ? "contactLead" : "whatsAppLead", updatedAt }),
        (existingDoc) => ["contactLead", "whatsAppLead"].includes(String(existingDoc.data().recordType || ""))
      ),
      syncCollectionExact(
        "plans",
        planDocuments,
        (plan) => slugify(plan.name),
        (plan) => ({ ...plan, updatedAt })
      ),
      syncCollectionExact(
        "trainers",
        trainers,
        (trainer) => trainer.slug,
        (trainer) => ({ ...trainer, updatedAt })
      )
    ]);

    return true;
  } catch {
    return false;
  }
}

async function syncCollectionExact<T>(
  collectionName: string,
  records: T[],
  getId: (record: T) => string,
  toDocument: (record: T) => Record<string, unknown>,
  shouldDeleteExisting: (existingDoc: { data: () => Record<string, unknown> }) => boolean = () => true
) {
  const db = getFirebaseDb();
  if (!db) return;

  const nextIds = new Set(records.map((record) => getId(record)));
  const collectionRef = collection(db, collectionName);
  const existing = await getDocs(collectionRef);

  await Promise.all([
    ...records.map((record) =>
      setDoc(doc(db, collectionName, getId(record)), toDocument(record), {
        merge: true
      })
    ),
    ...existing.docs
      .filter((existingDoc) => !nextIds.has(existingDoc.id) && shouldDeleteExisting(existingDoc))
      .map((existingDoc) => deleteDoc(doc(db, collectionName, existingDoc.id)))
  ]);
}

function createStableId(value: unknown) {
  return createHash("sha1").update(JSON.stringify(value)).digest("hex");
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
