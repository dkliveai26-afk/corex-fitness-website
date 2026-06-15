import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";

export const metadata: Metadata = {
  title: "CORE X FITNESS | Premium Gym & Personal Training",
  description: "CORE X FITNESS is a premium modern gym for strength training, cardio, personal coaching, flexible memberships, and healthy lifestyle support."
};

export default function Page() {
  return <HomePage />;
}
