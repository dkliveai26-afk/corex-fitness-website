import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { JoinRequestProvider } from "@/components/site/join-request";
import { Navbar } from "@/components/site/navbar";
import { SiteFooter } from "@/components/site/site-footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="public-site-shell min-h-screen overflow-x-hidden bg-zinc-950 text-white">
      <JoinRequestProvider>
        <AuthProvider>
          <Navbar />
          {children}
          <SiteFooter />
        </AuthProvider>
      </JoinRequestProvider>
    </main>
  );
}
