"use client";

import { useState } from "react";
import { DietLenisScroll } from "@/components/diet/diet-lenis-scroll";
import { buildWhatsAppHref, GYM_PHONE_NUMBER } from "@/components/site/contact-info";
import { PageShell } from "@/components/site/page-shell";
import { useWebsiteContent } from "@/lib/website-content-client";
import type { EditableDietPlan } from "@/lib/website-content";

const dietPlans: EditableDietPlan[] = [
  {
    enabled: true,
    id: "weight-loss",
    title: "Weight Loss Diet",
    description: "Clean meals for steady fat loss.",
    calories: "1,600",
    protein: "110g",
    meals: "5",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=90"
  },
  {
    enabled: true,
    id: "muscle-gain",
    title: "Muscle Gain Diet",
    description: "Protein-rich meals for lean mass.",
    calories: "2,800",
    protein: "170g",
    meals: "6",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=90"
  },
  {
    enabled: true,
    id: "fat-loss",
    title: "Fat Loss Diet",
    description: "Balanced food for fat control.",
    calories: "1,900",
    protein: "140g",
    meals: "5",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=90"
  },
  {
    enabled: true,
    id: "strength",
    title: "Strength Diet",
    description: "Fuel for lifting and recovery.",
    calories: "2,500",
    protein: "160g",
    meals: "5",
    image:
      "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=1200&q=90"
  },
  {
    enabled: true,
    id: "beginner",
    title: "Beginner Diet",
    description: "Simple meals for beginners.",
    calories: "2,000",
    protein: "120g",
    meals: "4",
    image:
      "https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=1200&q=90"
  },
  {
    enabled: true,
    id: "athlete",
    title: "Athlete Diet",
    description: "High-energy meals for athletes.",
    calories: "3,200",
    protein: "190g",
    meals: "6",
    image:
      "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=1200&q=90"
  }
];

const tips = [
  "Drink enough water",
  "Eat protein-rich foods",
  "Maintain meal timing",
  "Avoid junk food"
];

export function DietPage() {
  const { content } = useWebsiteContent();
  const section = content.sections.diet;
  
  // Database filter ko bypass karke direct upar wala code use karne ke liye fix:
  const displayedDietPlans = dietPlans;
  
  const [selectedPlan, setSelectedPlan] = useState<EditableDietPlan | null>(null);

  return (
    <PageShell>
      <DietLenisScroll />
      <section className="diet-reveal section-shell pt-8 pb-5 text-center sm:pt-12 sm:pb-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-400 sm:text-sm">{section.eyebrow}</p>
        <h1 className="mt-1 text-3xl font-black leading-tight sm:text-5xl">
          {section.title}
        </h1>
        <p className="mx-auto mt-3 max-w-[20rem] text-sm leading-7 text-zinc-300 sm:max-w-2xl sm:text-base">
          {section.subtitle}
        </p>
      </section>

      <section className="section-shell pb-12">
        <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
          {displayedDietPlans.map((plan) => (
            <DietCard key={plan.title} onView={setSelectedPlan} plan={plan} />
          ))}
        </div>
      </section>

      <section className="diet-reveal bg-zinc-900/70 py-10">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-red-400">Nutrition Tips</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Small habits that compound results</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {tips.map((tip) => (
              <article className="diet-card-reveal diet-reveal flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-5" key={tip}>
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-red-600/20 text-red-300 ring-1 ring-red-500/35">
                  <svg
                    aria-hidden="true"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.4"
                    viewBox="0 0 24 24"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </span>
                <p className="min-w-0 font-semibold leading-6 text-zinc-200">{tip}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="diet-reveal section-shell py-12">
        <div className="diet-card-reveal diet-reveal grid items-center gap-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[#111217]/95 p-6 shadow-card md:grid-cols-[0.45fr_1fr] md:p-8">
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            <img
              alt="CORE X FITNESS nutrition coach"
              className="absolute inset-0 h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=90"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-red-400">Diet Expert</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl xl:text-5xl">Guidance from our nutrition coach</h2>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:-translate-y-0.5 hover:bg-red-500"
                href={buildWhatsAppHref("Message: I want to contact the diet expert.")}
                title={GYM_PHONE_NUMBER}
              >
                <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.3 19.3 0 0 1-6-6A19.7 19.7 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
                </svg>
                Contact Expert
              </a>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:border-red-400 hover:bg-white/[0.08]"
                href={buildWhatsAppHref("Message: I want to message the diet expert.")}
                title={GYM_PHONE_NUMBER}
              >
                <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4h16v16H4z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
                Message Expert
              </a>
            </div>
          </div>
        </div>
      </section>

      {selectedPlan ? (
        <DietDetailsModal onClose={() => setSelectedPlan(null)} plan={selectedPlan} />
      ) : null}
    </PageShell>
  );
}

function DietCard({
  onView,
  plan
}: {
  onView: (plan: EditableDietPlan) => void;
  plan: EditableDietPlan;
}) {
  return (
    <article className="diet-card-reveal diet-reveal group flex h-full min-h-[410px] min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111217]/95 shadow-card backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-red-500/70 hover:shadow-red sm:min-h-[430px]">
      <div className="relative aspect-[16/9] min-h-[145px] overflow-hidden">
        <img
          alt={plan.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          src={plan.image}
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-xl font-black leading-tight">{plan.title}</h2>
        <p className="mt-2 flex-1 text-sm leading-5 text-zinc-400">{plan.description}</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <NutritionStat label="Calories/day" value={plan.calories} />
          <NutritionStat label="Protein" value={plan.protein} />
          <NutritionStat label="Meals/day" value={plan.meals} />
        </div>

        <button
          onClick={() => onView(plan)}
          className="mt-4 rounded-full bg-red-600 px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-red transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
          type="button"
        >
          View Diet
        </button>
      </div>
    </article>
  );
}

function DietDetailsModal({
  onClose,
  plan
}: {
  onClose: () => void;
  plan: EditableDietPlan;
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4 backdrop-blur-xl"
      role="dialog"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#111217] shadow-card">
        <div className="relative h-48">
          <img alt={plan.title} className="absolute inset-0 h-full w-full object-cover" src={plan.image} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111217] to-transparent" />
          <button
            aria-label="Close diet details"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-black/55 text-xl font-black text-white transition hover:bg-red-600"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>
        <div className="p-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Diet Details</p>
          <h3 className="mt-2 text-3xl font-black">{plan.title}</h3>
          <p className="mt-3 leading-7 text-zinc-300">{plan.description}</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <NutritionStat label="Calories/day" value={plan.calories} />
            <NutritionStat label="Protein" value={plan.protein} />
            <NutritionStat label="Meals/day" value={plan.meals} />
          </div>
          <button
            className="mt-6 w-full rounded-full bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:bg-red-500"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function NutritionStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-center">
      <p className="truncate text-base font-black text-white">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">{label}</p>
    </div>
  );
}
