"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDocs, onSnapshot, setDoc, writeBatch } from "firebase/firestore";
import { bootFirebaseClient, firebaseDb } from "@/lib/firebase-client";
import { defaultWebsiteContent, mergeWebsiteContent, type WebsiteContent } from "@/lib/website-content";

const contentKey = "core-x-fitness:website-content";
const contentChangeEvent = "core-x-fitness:website-content-change";
const contentDoc = () => doc(firebaseDb, "websiteContent", "main");

export function loadWebsiteContent() {
  if (typeof window === "undefined") return defaultWebsiteContent;

  try {
    const saved = window.localStorage.getItem(contentKey);
    return mergeWebsiteContent(saved ? JSON.parse(saved) as Partial<WebsiteContent> : null);
  } catch {
    return defaultWebsiteContent;
  }
}

export function useWebsiteContent() {
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    setContent(loadWebsiteContent());

    function handleLocalChange() {
      setContent(loadWebsiteContent());
    }

    window.addEventListener(contentChangeEvent, handleLocalChange);
    window.addEventListener("storage", handleLocalChange);

    bootFirebaseClient()
      .then(() => {
        unsubscribe = onSnapshot(
          contentDoc(),
          (snapshot) => {
            const nextContent = mergeWebsiteContent(snapshot.exists() ? snapshot.data() as Partial<WebsiteContent> : null);
            window.localStorage.setItem(contentKey, JSON.stringify(nextContent));
            setContent(nextContent);
            setIsLoading(false);
          },
          () => {
            setError("Live Firebase content sync is unavailable. Local content is still loaded.");
            setIsLoading(false);
          }
        );
      })
      .catch(() => {
        setError("Firebase content sync is unavailable. Local content is still loaded.");
        setIsLoading(false);
      });

    return () => {
      unsubscribe?.();
      window.removeEventListener(contentChangeEvent, handleLocalChange);
      window.removeEventListener("storage", handleLocalChange);
    };
  }, []);

  return { content, error, isLoading };
}

export async function saveWebsiteContent(content: WebsiteContent) {
  const normalized = mergeWebsiteContent({
    ...content,
    updatedAt: new Date().toISOString()
  });

  await bootFirebaseClient();
  await setDoc(contentDoc(), normalized, { merge: true });
  await syncWebsiteContentCollections(normalized);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(contentKey, JSON.stringify(normalized));
    window.dispatchEvent(new Event(contentChangeEvent));
  }

  return normalized;
}

async function syncWebsiteContentCollections(content: WebsiteContent) {
  await Promise.all([
    setDoc(doc(firebaseDb, "websiteHero", "main"), content.hero, { merge: true }),
    setDoc(doc(firebaseDb, "websiteContact", "main"), content.contact, { merge: true }),
    setDoc(doc(firebaseDb, "websiteFooter", "main"), content.footer, { merge: true }),
    syncCollection("websiteOffers", content.offers, (item) => item.id),
    syncCollection("websitePlans", content.plans, (item) => item.id),
    syncCollection("websiteTrainers", content.trainers, (item) => item.slug),
    syncCollection("websiteGallery", content.gallery, (item) => item.id),
    syncCollection("websiteDietPlans", content.dietPlans, (item) => item.id),
    syncCollection("websiteSections", Object.entries(content.sections).map(([id, section]) => ({ id, ...section })), (item) => item.id),
    syncCollection("websiteSocialLinks", content.socialLinks, (item) => item.id)
  ]);
}

async function syncCollection<T>(collectionName: string, items: T[], getId: (item: T) => string) {
  const collectionRef = collection(firebaseDb, collectionName);
  const existingDocs = await getDocs(collectionRef);
  const batch = writeBatch(firebaseDb);

  existingDocs.forEach((snapshot) => {
    batch.delete(snapshot.ref);
  });

  items.forEach((item, index) => {
    const rawId = getId(item) || `${collectionName}-${index + 1}`;
    batch.set(doc(firebaseDb, collectionName, sanitizeFirestoreId(rawId)), { ...item, order: index });
  });

  await batch.commit();
}

function sanitizeFirestoreId(value: string) {
  return String(value).replace(/\//g, "-").trim() || createFallbackId();
}

function createFallbackId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function uploadContentImage(file: File, folder = "website-content") {
  return uploadWithAdminRoute(file, folder);
}

async function uploadWithAdminRoute(file: File, folder = "website-content") {
  if (typeof window === "undefined") return "";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  try {
    const response = await fetch("/api/admin/upload", {
      body: formData,
      method: "POST"
    });

    if (!response.ok) return "";
    const data = await response.json() as { url?: string };
    return data.url || "";
  } catch {
    return "";
  }
}
