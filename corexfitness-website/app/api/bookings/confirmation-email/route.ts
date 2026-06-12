import { NextResponse } from "next/server";
import { getSmtpConfig, sendSmtpEmail } from "@/lib/smtp-mailer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const selectedPlan = String(body.selectedPlan || "").trim();
  const bookingId = String(body.bookingId || "").trim();

  if (!name || !email || !selectedPlan || !bookingId) {
    return NextResponse.json({ error: "Missing booking email fields." }, { status: 400 });
  }

  const config = getSmtpConfig();

  if (!config) {
    return NextResponse.json({ error: "SMTP is not configured." }, { status: 503 });
  }

  const message = [
    `Hello ${name},`,
    "",
    "Your booking has been successfully confirmed.",
    "",
    `Plan: ${selectedPlan}`,
    `Booking ID: ${bookingId}`,
    "",
    "Thank you for choosing our gym."
  ].join("\n");

  await sendSmtpEmail(config, {
    subject: "Booking Confirmed",
    text: message,
    to: email
  });

  return NextResponse.json({ ok: true });
}
