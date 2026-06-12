"use client";

import { useEffect } from "react";
import { bootFirebaseClient } from "@/lib/firebase-client";
import { seedFirebasePublicCollections } from "@/lib/firebase-client-writes";

export function FirebaseBootstrap() {
  useEffect(() => {
    void bootFirebaseClient().then(() => seedFirebasePublicCollections()).catch(() => undefined);
  }, []);

  return null;
}
