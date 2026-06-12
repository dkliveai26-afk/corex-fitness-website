import fs from "node:fs/promises";
import path from "node:path";
import { MongoClient } from "mongodb";
import { emptyGymDataStore, type GymDataStore } from "@/lib/gym-data-models";
import { getFirebaseGymDataStore, saveFirebaseGymDataStore } from "@/lib/firebase-server-store";

const gymDataPath = path.join(process.cwd(), "data", "gym-data-store.json");
const collectionName = "gymManagementData";

let clientPromise: Promise<MongoClient> | null = null;

async function getMongoClient() {
  if (!process.env.MONGODB_URI) return null;
  clientPromise ??= new MongoClient(process.env.MONGODB_URI).connect();
  return clientPromise;
}

function normalizeGymDataStore(store: Partial<GymDataStore> | null | undefined): GymDataStore {
  return {
    members: Array.isArray(store?.members) ? store.members : [],
    bookings: Array.isArray(store?.bookings) ? store.bookings : [],
    payments: Array.isArray(store?.payments) ? store.payments : [],
    contactLeads: Array.isArray(store?.contactLeads) ? store.contactLeads : [],
    whatsAppLeads: Array.isArray(store?.whatsAppLeads) ? store.whatsAppLeads : [],
    gymSheetRows: Array.isArray(store?.gymSheetRows) ? store.gymSheetRows : [],
    settings: store?.settings
  };
}

export async function getGymDataStore(): Promise<GymDataStore> {
  const firebaseStore = await getFirebaseGymDataStore();

  if (firebaseStore) {
    return normalizeGymDataStore(firebaseStore);
  }

  const fallbackStore = await getFallbackGymDataStore();
  await saveFirebaseGymDataStore(fallbackStore);
  return fallbackStore;
}

async function getFallbackGymDataStore(): Promise<GymDataStore> {
  const client = await getMongoClient();

  if (client) {
    const db = client.db(process.env.MONGODB_DB || "core_x_fitness");
    const doc = await db.collection(collectionName).findOne<{ store: GymDataStore }>({
      _id: "main" as never
    });
    return normalizeGymDataStore(doc?.store);
  }

  try {
    const raw = await fs.readFile(gymDataPath, "utf8");
    return normalizeGymDataStore(JSON.parse(raw) as Partial<GymDataStore>);
  } catch {
    await saveGymDataStore(emptyGymDataStore);
    return emptyGymDataStore;
  }
}

export async function saveGymDataStore(store: GymDataStore) {
  const normalizedStore = normalizeGymDataStore(store);
  await saveFirebaseGymDataStore(normalizedStore);
  const client = await getMongoClient();

  if (client) {
    const db = client.db(process.env.MONGODB_DB || "core_x_fitness");
    await db.collection(collectionName).updateOne(
      { _id: "main" as never },
      { $set: { store: normalizedStore, updatedAt: new Date() } },
      { upsert: true }
    );
    return normalizedStore;
  }

  await fs.mkdir(path.dirname(gymDataPath), { recursive: true });
  await fs.writeFile(gymDataPath, JSON.stringify(normalizedStore, null, 2));
  return normalizedStore;
}
