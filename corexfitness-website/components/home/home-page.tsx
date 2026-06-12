"use client";

import Image from "next/image";
import Link from "next/link";
import { HomeLenisScroll } from "@/components/home/home-lenis-scroll";
import { Icon, StarRating } from "@/components/site/icons";
import { images } from "@/components/site/data";
import { JoinNowButton } from "@/components/site/join-request";
import { PageShell } from "@/components/site/page-shell";
import { formatPlanCurrency, getPlanPricing } from "@/components/site/plan-pricing";
import { SectionHeading } from "@/components/site/section-heading";
import { useWebsiteContent } from "@/lib/website-content-client";
import type { EditableHero, EditablePlan } from "@/lib/website-content";

const whyChooseUs = [
  {
    title: "Modern Equipment",
    text: "Premium strength machines, free weights, and cardio stations built for serious training.",
    icon: "dumbbell"
  },
  {
    title: "Expert Trainers",
    text: "Certified coaches who guide your form, progression, and consistency.",
    icon: "trainer"
  },
  {
    title: "Flexible Timings",
    text: "A schedule that supports early risers, after-work training, and weekend sessions.",
    icon: "clock"
  },
  {
    title: "Healthy Environment",
    text: "A clean, focused, high-energy space where every member can train with confidence.",
    icon: "heart"
  }
] as const;

const facilities = [
  {
    name: "Treadmill Zone",
    description: "Modern cardio machines for endurance training",
    image:
      "https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?auto=format&fit=crop&w=900&q=90"
  },
  {
    name: "Weight Training Area",
    description: "Advanced equipment for strength building",
    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=90"
  },
  {
    name: "Dumbbell Section",
    description: "Multiple weight ranges for all members",
    image:
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=900&q=90"
  },
  {
    name: "Personal Training",
    description: "Professional guidance from expert trainers",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=90"
  },
  {
    name: "Locker Room",
    description: "Safe and clean storage area",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=90"
  },
  {
    name: "Diet Support",
    description: "Basic fitness and nutrition guidance",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=90"
  }
];

const testimonials = [
  {
    name: "Priya S.",
    review: "The space feels premium, the coaching is sharp, and the routine finally fits my life."
  },
  {
    name: "Karan M.",
    review: "CORE X FITNESS has the equipment and atmosphere I needed to stay consistent."
  },
  {
    name: "Neha R.",
    review: "The trainers helped me train smarter, not just harder. I feel stronger every week."
  }
];

export function HomePage() {
  const { content } = useWebsiteContent();

  return (
    <PageShell>
      <HomeLenisScroll />
      <HeroSection eyebrow={content.sections.home.eyebrow} hero={content.hero} />
      <WhyChooseUs />
      <FacilitiesSection />
      <MembershipPreview plans={content.plans.filter((plan) => plan.enabled)} />
      <Testimonials />
    </PageShell>
  );
}

function HeroSection({ eyebrow, hero }: { eyebrow: string; hero: EditableHero }) {
  return (
    <section className="home-hero-banner relative flex min-h-[590px] items-center overflow-hidden pt-16 sm:min-h-[88vh] sm:pt-20">
      <Image
        alt="Athletes training inside CORE X FITNESS"
        className="home-hero-image object-cover"
        fill
        priority
        sizes="100vw"
        src={hero.image || images.hero}
        unoptimized
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94),rgba(0,0,0,0.68),rgba(0,0,0,0.25))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(220,38,38,0.34),transparent_30rem)]" />
      <div className="section-shell relative py-10 sm:py-24">
        <div className="max-w-3xl animate-rise">
          <p className="mb-4 inline-flex rounded-md border border-red-500/35 bg-red-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-300 sm:mb-5 sm:px-4 sm:text-xs sm:tracking-[0.22em]">
            {eyebrow}
          </p>
          <h1 className="max-w-[21rem] text-[2rem] font-black leading-[1.08] tracking-normal text-white sm:max-w-none sm:text-6xl sm:leading-[0.95] lg:text-7xl">
            {hero.title}
          </h1>
          <p className="mt-4 max-w-[20rem] text-sm leading-7 text-zinc-200 sm:mt-6 sm:max-w-2xl sm:text-lg sm:leading-8">
            {hero.subtitle}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-9 sm:gap-4">
            <JoinNowButton className="rounded-md bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-wide shadow-red transition hover:-translate-y-1 hover:bg-red-500 sm:px-6 sm:py-4 sm:text-sm" label={hero.primaryButtonText} />
            <Link className="rounded-md border border-white/20 bg-white/10 px-5 py-3 text-xs font-black uppercase tracking-wide transition hover:-translate-y-1 hover:border-red-400 hover:text-red-200 sm:px-6 sm:py-4 sm:text-sm" href="/plans">
              {hero.secondaryButtonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  return (
    <section className="home-reveal py-20 sm:py-24">
      <div className="section-shell">
        <SectionHeading eyebrow="Why Choose Us" title="Built for people who train with intent" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseUs.map((item, index) => (
            <article
              className="home-card-premium home-reveal animate-rise rounded-lg border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-2 hover:border-red-400/70"
              key={item.title}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <Icon name={item.icon} />
              <h3 className="mt-5 text-xl font-black">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MembershipPreview({ plans }: { plans: EditablePlan[] }) {
  return (
    <section className="home-reveal bg-zinc-900/70 py-10 sm:py-12">
      <div className="section-shell">
        <div className="mb-10 max-w-3xl lg:mb-9 lg:max-w-[760px]">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-red-400 lg:text-xs">Membership Preview</p>
          <h2 className="membership-preview-heading mt-3 text-3xl font-black tracking-normal sm:text-5xl lg:max-w-[760px] lg:whitespace-normal lg:leading-[0.95]">
            Plans for every fitness starting point
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const pricing = getPlanPricing(plan);

            return (
              <article
                className={`home-card-premium home-reveal relative flex flex-col rounded-lg border p-6 transition hover:-translate-y-2 lg:min-h-[340px] lg:p-5 ${
                  index === 1 ? "border-red-500 bg-red-950/30 shadow-red" : "border-white/10 bg-white/[0.04]"
                }`}
                key={plan.name}
              >
                <span className="absolute right-5 top-5 rounded-md bg-red-600 px-3 py-1 text-xs font-black uppercase">
                  {pricing.offerPercent}% OFF
                </span>
                <h3 className="membership-plan-name pr-24 text-2xl font-black lg:leading-tight">{plan.name}</h3>
                <div className="mt-4 lg:mt-5">
                  <p className="premium-mrp-price text-zinc-500">
                    &#8377;{formatPlanCurrency(pricing.mrpPrice)}
                    <span className="ml-1 text-xs font-black text-zinc-500">/mo</span>
                  </p>
                  <p className="premium-final-price membership-plan-price mt-1 leading-none lg:tracking-tight">
                    &#8377;{formatPlanCurrency(pricing.finalPrice)}
                    <span className="membership-plan-period ml-1 font-semibold text-zinc-400">/mo</span>
                  </p>
                </div>
                <ul className="mt-5 space-y-3 text-sm text-zinc-300 lg:mt-5 lg:space-y-2.5 lg:text-sm">
                  {plan.features.slice(0, 3).map((feature) => (
                    <li className="flex gap-3" key={feature}>
                      <span className="mt-1 size-2 rounded-full bg-red-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link className="mt-7 inline-flex w-full justify-center rounded-md border border-white/15 px-5 py-3 text-sm font-black uppercase transition hover:border-red-400 hover:bg-red-600 lg:mt-auto lg:py-2.5 lg:text-sm" href="/plans">
                  {plan.buttonText || "View Details"}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
function FacilitiesSection() {
  return (
    <section className="home-reveal bg-zinc-900/70 py-20 sm:py-24">
      <div className="section-shell">
        <SectionHeading eyebrow="Facilities" title="Our Gym Facilities" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <article
              className="home-card-premium home-reveal group flex h-full min-h-[390px] min-w-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#111217]/95 shadow-card transition hover:-translate-y-2 hover:border-red-400/70 hover:shadow-red"
              key={facility.name}
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  alt={facility.name}
                  className="object-cover transition duration-500 group-hover:scale-105"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  src={facility.image}
                  unoptimized
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-black">{facility.name}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{facility.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="home-reveal py-20 sm:py-24">
      <div className="section-shell">
        <SectionHeading eyebrow="Testimonials" title="Real members. Real momentum." />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article className="home-card-premium home-reveal rounded-lg border border-white/10 bg-white/[0.04] p-6" key={testimonial.name}>
              <StarRating />
              <p className="mt-5 leading-7 text-zinc-300">{testimonial.review}</p>
              <h3 className="mt-6 font-black">{testimonial.name}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}











