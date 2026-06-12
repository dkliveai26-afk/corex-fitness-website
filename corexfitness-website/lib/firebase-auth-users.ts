"use client";

import type { User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase-client";

export async function saveFirebaseAuthUser(user: User, fullName = "") {
  await setDoc(
    doc(firebaseDb, "users", user.uid),
    {
      authProvider: user.providerData[0]?.providerId || "password",
      displayName: fullName || user.displayName || "",
      email: user.email || "",
      lastLoginAt: serverTimestamp(),
      photoURL: user.photoURL || "",
      recordType: "authUser",
      role: "member",
      uid: user.uid,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}
