"use client";

import { FormEvent, useState } from "react";
import { useFirebaseAuth } from "@/components/auth/auth-provider";
import { PlansLenisScroll } from "@/components/plans/plans-lenis-scroll";
import { GYM_PHONE_NUMBER } from "@/components/site/contact-info";
import { PageShell } from "@/components/site/page-shell";
import { formatPlanCurrency, getPlanPricing } from "@/components/site/plan-pricing";
import { notifyAdmin } from "@/lib/client-notifications";
import { addBookingMember } from "@/lib/gym-management-store";
import type { BookingData } from "@/lib/gym-data-models";
import { useWebsiteContent } from "@/lib/website-content-client";
import type { EditablePlan } from "@/lib/website-content";

const plans: EditablePlan[] = [
  {
    enabled: true,
    id: "beginner-plan",
    name: "Beginner Plan",
    description: "Ideal for beginners starting a consistent fitness routine.",
    duration: "1 Month",
    mrpPrice: "2000",
    offerPercent: "20",
    price: "1600",
    buttonText: "Book Now",
    features: ["Gym Access", "Cardio Access", "Basic Support", "Locker Access", "Fitness Assessment"]
  },
  {
    enabled: true,
    id: "standard-plan",
    name: "Standard Plan",
    description: "Everything you need to train stronger with coach support.",
    duration: "3 Months",
    mrpPrice: "2499",
    offerPercent: "20",
    price: "1999",
    buttonText: "Book Now",
    badge: "Most Popular",
    features: ["Gym Access", "Cardio Access", "Weight Training", "Trainer Support", "Diet Guidance"]
  },
  {
    enabled: true,
    id: "premium-plan",
    name: "Premium Plan",
    description: "Tailored training support for complete body transformation.",
    duration: "6 Months",
    mrpPrice: "4999",
    offerPercent: "20",
    price: "3999",
    buttonText: "Book Now",
    badge: "Best Value",
    features: ["Gym Access", "Cardio Access", "Weight Training", "Personal Trainer", "Diet Guidance"]
  }
];

const initialBookingForm = {
  fullName: "",
  phone: "",
  email: "",
  age: "",
  gender: "",
  joiningDate: ""
};

type Plan = EditablePlan;
type BookingForm = typeof initialBookingForm;
type BookingField = keyof BookingForm;

export function PlansPage() {
  return (
    <PageShell>
      <PlansPageContent />
    </PageShell>
  );
}

function PlansPageContent() {
  const { authUser, requireAuth } = useFirebaseAuth();
  const { content } = useWebsiteContent();
  const visiblePlans = content.plans.filter((plan) => plan.enabled);
  const pagePlans = visiblePlans.length ? visiblePlans : plans;
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingForm>(initialBookingForm);
  const [errors, setErrors] = useState<Partial<Record<BookingField, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<BookingData | null>(null);

  function openBooking(plan: Plan) {
    requireAuth(
      () => openBookingForm(plan),
      "Please login or sign up before booking your membership plan."
    );
  }

  function openBookingForm(plan: Plan) {
    setSelectedPlan(plan);
    setBookingForm({
      ...initialBookingForm,
      email: authUser?.email || "",
      fullName: authUser?.displayName || ""
    });
    setErrors({});
    setBookingSuccess(null);
  }

  function closeBooking() {
    setSelectedPlan(null);
    setBookingForm(initialBookingForm);
    setErrors({});
    setIsSubmitting(false);
    setBookingSuccess(null);
  }

  function updateBookingField(field: BookingField, value: string) {
    setBookingForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateBookingForm(formToValidate: BookingForm) {
    const nextErrors: Partial<Record<BookingField, string>> = {};

    if (!formToValidate.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!/^[0-9+\-\s()]{7,16}$/.test(formToValidate.phone.trim())) nextErrors.phone = "Enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formToValidate.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!formToValidate.age.trim() || Number(formToValidate.age) < 12 || Number(formToValidate.age) > 90) {
      nextErrors.age = "Enter an age between 12 and 90.";
    }
    if (!formToValidate.gender) nextErrors.gender = "Select gender.";
    if (!formToValidate.joiningDate) nextErrors.joiningDate = "Select joining date.";

    return nextErrors;
  }

  function confirmBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const data = new FormData(event.currentTarget);
    const submittedForm: BookingForm = {
      fullName: String(data.get("fullName") || bookingForm.fullName),
      phone: String(data.get("phone") || bookingForm.phone),
      email: String(data.get("email") || bookingForm.email),
      age: String(data.get("age") || bookingForm.age),
      gender: String(data.get("gender") || bookingForm.gender),
      joiningDate: String(data.get("joiningDate") || bookingForm.joiningDate)
    };
    setBookingForm(submittedForm);

    const nextErrors = validateBookingForm(submittedForm);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setIsSubmitting(true);
      const selectedPlanPrice = selectedPlan ? getPlanPricing(selectedPlan).finalPrice : undefined;
      const result = addBookingMember({
        fullName: submittedForm.fullName,
        phone: submittedForm.phone,
        email: submittedForm.email,
        age: submittedForm.age,
        gender: submittedForm.gender,
        joiningDate: submittedForm.joiningDate,
        selectedPlan: selectedPlan?.name || "Membership Plan",
        feesAmount: selectedPlanPrice
      });
      
      // Har browser ke liye standard HTML5 Audio trigger kiya bina freeze hue
      try {
        const audio = new Audio("/success.mp3");
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const gain = context.createGain();
        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.42, context.currentTime + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.78);
        gain.connect(context.destination);

        [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
          const oscillator = context.createOscillator();
          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(frequency, context.currentTime + index * 0.12);
          oscillator.connect(gain);
          oscillator.start(context.currentTime + index * 0.12);
          oscillator.stop(context.currentTime + index * 0.12 + 0.24);
        });
        audio.play().catch(() => {});
      } catch (e) {
        console.log(e);
      }
      
      void sendBookingConfirmationEmail(result.booking);
      notifyAdmin({
        type: "booking",
        subject: `New Booking - ${result.booking.userName} - ${result.booking.selectedPlan}`,
        details: {
          "Booking ID": result.booking.bookingId,
          Name: result.booking.userName,
          Phone: result.booking.phoneNumber,
          Email: result.booking.email,
          Plan: result.booking.selectedPlan,
          Date: result.booking.bookingDate,
          Time: result.booking.bookingTime,
          "Payment Method": "Cash on Gym",
          "Payment Status": "Pending Cash Payment"
        }
      });
      setBookingSuccess(result.booking);
      setIsSubmitting(false);
    }
  }

  return (
      <>
        <PlansLenisScroll />
        <section className="plans-reveal section-shell pt-20 pb-8 text-center sm:pt-24 sm:pb-10 lg:pt-24 lg:pb-8">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-red-400">{content.sections.plans.eyebrow}</p>
          <p className="mx-auto mt-3 max-w-[20rem] text-base leading-8 text-zinc-300 sm:max-w-2xl sm:text-lg lg:text-base">
            {content.sections.plans.subtitle}
          </p>
      </section>

      <section className="section-shell pb-14 lg:pb-12">
        <div className="mx-auto grid max-w-4xl items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {pagePlans.map((plan) => (
            <PlanCard key={plan.name} onBook={openBooking} plan={plan} />
          ))}
        </div>
      </section>

      <section className="plans-reveal bg-zinc-900/70 py-16">
        <div className="section-shell">
          <img
            alt="CORE X FITNESS 20% off membership banner"
            className="block w-full rounded-2xl border border-white/10 object-cover shadow-red"
            src="/images/plans-offer-banner.png"
          />
        </div>
      </section>

      {selectedPlan ? (
        <BookingModal
          errors={errors}
          form={bookingForm}
          success={bookingSuccess}
          onCancel={closeBooking}
          onConfirm={confirmBooking}
          onUpdate={updateBookingField}
          isSubmitting={isSubmitting}
          plan={selectedPlan}
        />
      ) : null}
    </>
  );
}

function PlanCard({ onBook, plan }: { onBook: (plan: Plan) => void; plan: Plan }) {
  const isFeatured = Boolean(plan.badge);
  const pricing = getPlanPricing(plan);

  return (
    <article
      className={`plans-card-reveal plans-reveal group relative mx-auto flex h-full min-h-[300px] w-full max-w-[17rem] min-w-0 flex-col overflow-hidden rounded-[1.25rem] border px-4 py-3 shadow-card backdrop-blur-2xl transition duration-300 hover:-translate-y-2 hover:scale-[1.02] sm:min-h-[320px] sm:px-4 sm:py-3 lg:min-h-[300px] lg:px-4 lg:py-3 ${
        isFeatured
          ? "border-red-500/55 bg-[#111217] hover:shadow-red"
          : "border-white/10 bg-[#111217]/95 hover:border-red-400/60 hover:shadow-red"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/[0.08] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-red-600/35 via-red-500/10 to-transparent opacity-70 transition group-hover:opacity-100" />
      <div className="pointer-events-none absolute -bottom-20 left-1/2 size-44 -translate-x-1/2 rounded-full bg-red-500/20 blur-3xl transition group-hover:bg-red-500/35" />
      <span className="absolute right-3 top-3 z-10 rounded-full border border-red-400/35 bg-red-600/95 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white shadow-[0_10px_24px_rgba(220,38,38,0.28)]">
        {pricing.offerPercent}% OFF
      </span>
      <div className="relative z-10 mb-1 flex min-h-5 justify-start">
        {plan.badge ? (
          <span className="inline-flex max-w-[7rem] rounded-full border border-red-400/40 bg-white/[0.06] px-2.5 py-1 text-center text-[9px] font-black uppercase tracking-wide text-zinc-200">
            {plan.badge}
          </span>
        ) : null}
      </div>

      <div className="relative text-center">
        <h2 className="text-lg font-black leading-tight text-white sm:text-xl lg:text-lg">{plan.name}</h2>
        <p className="mx-auto mt-1.5 max-w-[13rem] text-[11px] leading-4 text-zinc-400">{plan.description}</p>
      </div>

      <div className="relative mt-1.5 text-center lg:mt-1.5">
        <p className="plans-original-price premium-mrp-price mx-auto mb-1 text-zinc-500">
          &#8377;{formatPlanCurrency(pricing.mrpPrice)}
          <span className="ml-1 text-xs font-black text-zinc-500">/month</span>
        </p>
        <p className="flex flex-wrap items-baseline justify-center gap-x-1 text-white">
          <span className="plans-offer-price inline-flex transform-gpu font-black leading-none tracking-normal text-[#ff5a1f] transition duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-105 group-hover:drop-shadow-[0_0_18px_rgba(255,90,31,0.65)]">
            &#8377;{formatPlanCurrency(pricing.finalPrice)}
          </span>
          <span className="plans-price-period font-bold text-zinc-400">/month</span>
        </p>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
          Duration: {plan.duration}
        </p>
      </div>

      <ul className="relative mt-2 flex-1 space-y-0.5 text-xs text-zinc-200 lg:mt-2 lg:space-y-0.5">
        {plan.features.map((feature) => (
          <li className="flex items-start gap-3" key={feature}>
            <span className="mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-full bg-[#ff5a1f]/20 text-[#ff6a2a] ring-1 ring-[#ff5a1f]/30">
              <svg aria-hidden="true" className="size-2.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24">
                <path d="m5 12 4 4L19 6" />
              </svg>
            </span>
            <span className="min-w-0 leading-4 text-zinc-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onBook(plan)}
        className={`relative mt-3 w-full rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wide transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
          isFeatured
            ? "bg-[#ff5a1f] text-white shadow-red hover:bg-[#ff6a2a]"
            : "bg-zinc-600/80 text-white hover:bg-[#ff5a1f] hover:shadow-red"
        }`}
        type="button"
      >
        {plan.buttonText || "Book Now"}
      </button>
    </article>
  );
}

function BookingModal({
  errors,
  form,
  success,
  onCancel,
  onConfirm,
  onUpdate,
  isSubmitting,
  plan
}: {
  errors: Partial<Record<BookingField, string>>;
  form: BookingForm;
  success: BookingData | null;
  onCancel: () => void;
  onConfirm: (event: FormEvent<HTMLFormElement>) => void;
  onUpdate: (field: BookingField, value: string) => void;
  isSubmitting: boolean;
  plan: Plan;
}) {
  const pricing = getPlanPricing(plan);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      {success ? (
        <div className="my-4 w-full max-w-lg rounded-[1.5rem] border border-emerald-400/25 bg-[#101713] p-5 text-center shadow-card sm:p-6">
          <div className="relative mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/50">
            <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
            <svg aria-hidden="true" className="size-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24">
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>
          <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300">Booking Successful</p>
          <h2 className="mx-auto mt-2 max-w-sm text-xl font-black leading-tight sm:text-2xl">Thank you for choosing our gym.</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-4 text-left text-sm">
            <SummaryItem label="Booking ID" value={success.bookingId} />
            <SummaryItem label="Selected Plan" value={success.selectedPlan} />
            <SummaryItem label="Amount To Be Paid" value={`Rs. ${formatPlanCurrency(success.feesAmount ?? pricing.finalPrice)}`} />
            <SummaryItem label="Payment Method" value="Cash on Gym" />
            <SummaryItem label="Payment Status" value="Pending Cash Payment" />
          </div>
          <button className="mt-4 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-black uppercase tracking-wide text-white shadow-[0_12px_32px_rgba(16,185,129,0.28)] transition hover:bg-emerald-500" onClick={onCancel} type="button">
            Done
          </button>
        </div>
      ) : (
      <form
        className="my-6 w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#111217] p-5 shadow-card sm:p-7"
        onSubmit={onConfirm}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Book Membership</p>
            <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{plan.name}</h2>
          </div>
          <button
            aria-label="Cancel booking"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-xl font-bold text-white transition hover:border-red-400 hover:bg-red-600"
            onClick={onCancel}
            type="button"
          >
            x
          </button>
        </div>

        <div className="mt-5 grid gap-3 rounded-2xl border border-red-500/25 bg-red-600/10 p-4 text-sm sm:grid-cols-3">
          <SummaryItem label="Selected Plan" value={plan.name} />
          <SummaryItem label="Duration" value={plan.duration} />
          <SummaryItem label="Plan Price" value={`Rs. ${formatPlanCurrency(pricing.finalPrice)}`} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <BookingField error={errors.fullName} label="Full Name">
            <input className="contact-input" name="fullName" onChange={(event) => onUpdate("fullName", event.target.value)} placeholder="Your full name" type="text" value={form.fullName} />
          </BookingField>

          <BookingField error={errors.phone} label="Phone Number">
            <input className="contact-input" name="phone" onChange={(event) => onUpdate("phone", event.target.value)} placeholder={GYM_PHONE_NUMBER} type="tel" value={form.phone} />
          </BookingField>

          <BookingField error={errors.email} label="Email">
            <input className="contact-input" name="email" onChange={(event) => onUpdate("email", event.target.value)} placeholder="you@example.com" type="email" value={form.email} />
          </BookingField>

          <BookingField error={errors.age} label="Age">
            <input className="contact-input" max="90" min="12" name="age" onChange={(event) => onUpdate("age", event.target.value)} placeholder="25" type="number" value={form.age} />
          </BookingField>

          <BookingField error={errors.gender} label="Gender">
            <select className="contact-input" name="gender" onChange={(event) => onUpdate("gender", event.target.value)} value={form.gender}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </BookingField>

          <BookingField error={errors.joiningDate} label="Joining Date">
            <input className="contact-input" name="joiningDate" onChange={(event) => onUpdate("joiningDate", event.target.value)} type="date" value={form.joiningDate} />
          </BookingField>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            className="inline-flex justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:-translate-y-0.5 hover:bg-red-500"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Submitting..." : "Confirm Booking"}
          </button>
          <button
            className="inline-flex justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:border-red-400 hover:bg-white/[0.08]"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        </div>
      </form>
      )}
    </div>
  );
}

function BookingField({
  children,
  error,
  label
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-black uppercase tracking-[0.16em] text-zinc-300">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error ? <span className="mt-2 block text-sm font-semibold text-red-300">{error}</span> : null}
    </label>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-200">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-white">{value}</p>
    </div>
  );
}

async function sendBookingConfirmationEmail(booking: BookingData) {
  if (!booking.email) return;

  const body = [
    `Hello ${booking.userName},`,
    "",
    "Your booking has been successfully confirmed.",
    "",
    `Plan: ${booking.selectedPlan}`,
    `Booking ID: ${booking.bookingId}`,
    "",
    "Thank you for choosing our gym."
  ].join("\n");

  try {
    const response = await fetch("/api/bookings/confirmation-email", {
      body: JSON.stringify({
        bookingId: booking.bookingId,
        email: booking.email,
        name: booking.userName,
        selectedPlan: booking.selectedPlan
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    window.localStorage.setItem(
      "power-house-fitness:last-booking-confirmation-email",
      JSON.stringify({
        body,
        email: booking.email,
        sent: response.ok,
        status: response.status,
        subject: "Booking Confirmed",
        savedAt: new Date().toISOString()
      })
    );
  } catch {
    window.localStorage.setItem(
      "power-house-fitness:last-booking-confirmation-email",
      JSON.stringify({
        body,
        email: booking.email,
        sent: false,
        subject: "Booking Confirmed",
        savedAt: new Date().toISOString()
      })
    );
  }
}
