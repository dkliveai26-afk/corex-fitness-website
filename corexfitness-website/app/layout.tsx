import type { Metadata } from "next";
import { FirebaseBootstrap } from "@/components/site/firebase-bootstrap";
import "./globals.css";

export const metadata: Metadata = {
  title: "CORE X FITNESS | Premium Gym & Personal Training",
  description:
    "CORE X FITNESS is a premium modern gym for strength training, cardio, personal coaching, flexible memberships, and healthy lifestyle support.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=20260601", sizes: "any" },
      { url: "/favicons/favicon-16x16.png?v=20260601", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png?v=20260601", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-48x48.png?v=20260601", sizes: "48x48", type: "image/png" },
      { url: "/favicons/favicon-64x64.png?v=20260601", sizes: "64x64", type: "image/png" },
      { url: "/favicons/favicon-512x512.png?v=20260601", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/favicons/apple-touch-icon.png?v=20260601", sizes: "180x180", type: "image/png" }]
  },
  keywords: [
    "CORE X FITNESS",
    "premium gym",
    "fitness training",
    "personal trainer",
    "membership plans",
    "strength training"
  ],
  openGraph: {
    title: "CORE X FITNESS",
    description: "Transform your body with premium equipment, expert trainers, and flexible gym plans.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <FirebaseBootstrap />
        {children}
      </body>
    </html>
  );
}
