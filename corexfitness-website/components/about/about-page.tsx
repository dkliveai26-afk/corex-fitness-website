"use client";

import Image from "next/image";
import { AboutLenisScroll } from "@/components/about/about-lenis-scroll";
import { Icon } from "@/components/site/icons";
import { PageShell } from "@/components/site/page-shell";
import { SectionHeading } from "@/components/site/section-heading";
import { useWebsiteContent } from "@/lib/website-content-client";

const aboutImages = {
  main:
    "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1600&q=90",
  lift:
    "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=1200&q=90",
  cardio:
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=90",
  trainer:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=90"
};

const values = [
  {
    title: "Our Mission",
    text: "To help every member build strength, discipline, and confidence through focused coaching and a world-class training environment."
  },
  {
    title: "Our Vision",
    text: "To become the most trusted fitness destination for people who want sustainable progress, not short-term hype."
  }
];

const differences = [
  "Premium equipment arranged for smooth, efficient workouts.",
  "Trainer-led guidance that keeps technique and progression clear.",
  "A clean, high-energy atmosphere built around consistency.",
  "Flexible training support for beginners and experienced athletes."
];

export function AboutPage() {
  const { content } = useWebsiteContent();
  const section = content.sections.about;
  const pageImages = content.about.images.length
    ? content.about.images
    : [aboutImages.lift, aboutImages.cardio, aboutImages.main, aboutImages.trainer];
  const pageValues = content.about.values.length ? content.about.values : values;
  const pageDifferences = content.about.differences.length ? content.about.differences : differences;
  const mainImage = content.about.heroImage || aboutImages.main;
  const trainerImage = pageImages[3] || aboutImages.trainer;

  return (
    <PageShell>
      <AboutLenisScroll />
      <section className="about-reveal section-shell grid min-h-screen items-center gap-7 pt-28 pb-14 sm:gap-10 sm:pt-36 sm:pb-20 lg:grid-cols-[1fr_0.9fr]">
        <div className="about-reveal about-card-premium animate-rise max-w-3xl rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-card sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <p className="mb-4 inline-flex rounded-md border border-red-500/35 bg-red-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-300 sm:mb-5 sm:px-4 sm:text-xs sm:tracking-[0.22em]">
            {section.eyebrow}
          </p>
          <h1 className="text-3xl font-black leading-[1.08] sm:text-6xl sm:leading-tight">
            {section.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:mt-6 sm:text-lg sm:leading-8">
            {section.subtitle}
          </p>
        </div>
        <div className="about-card-premium about-float-soft group relative aspect-[16/12] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-card transition duration-300 hover:-translate-y-1 hover:border-red-500/50 hover:shadow-red sm:aspect-[4/5] sm:rounded-[2rem] lg:h-[38vh] lg:aspect-auto">
          <Image alt="CORE X FITNESS luxury gym floor" className="object-cover transition duration-700 group-hover:scale-105" fill priority sizes="(min-width: 1024px) 45vw, 100vw" src={mainImage} unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </div>
      </section>

      <section className="about-reveal bg-zinc-900/70 py-14 sm:py-24">
        <div className="section-shell">
          <div className="grid gap-5 md:grid-cols-2">
            {pageValues.map((value) => (
              <article className="about-reveal about-card-premium rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 shadow-card backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-red-500/50 hover:shadow-red sm:p-7" key={value.title}>
                <Icon name="spark" />
                <h2 className="mt-4 text-2xl font-black sm:mt-5 sm:text-3xl">{value.title}</h2>
                <p className="mt-3 text-sm leading-7 text-zinc-300 sm:mt-4 sm:text-base">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-reveal py-14 sm:py-24">
        <div className="section-shell grid items-start gap-7 sm:gap-10 lg:grid-cols-[0.9fr_1fr]">
          <div className="about-reveal about-card-premium rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-card sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
            <SectionHeading eyebrow="Our Difference" title={content.about.differenceTitle} />
            <p className="max-w-xl text-sm leading-7 text-zinc-300 sm:text-base sm:leading-8">
              The experience is designed to be intense without being chaotic, premium without feeling cold, and supportive without lowering the standard.
            </p>
          </div>
          <div className="grid gap-4">
            {pageDifferences.map((difference) => (
              <div className="about-reveal about-card-premium flex gap-3 rounded-[1.25rem] border border-white/10 bg-[#111217]/95 p-4 shadow-card transition duration-300 hover:-translate-y-1 hover:border-red-500/50 hover:shadow-red sm:gap-4 sm:p-5" key={difference}>
                <span className="mt-2 size-2.5 shrink-0 rounded-full bg-red-500 shadow-red" />
                <p className="text-sm leading-7 text-zinc-300 sm:text-base">{difference}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-reveal bg-zinc-900/70 py-14 sm:py-24">
        <div className="section-shell">
          <SectionHeading eyebrow="Gym Images" title="Inside the training space" />
        </div>
        <div className="section-shell">
          <div className="about-image-train" aria-label="CORE X FITNESS gym image carousel">
            <div className="about-image-track">
              {[...pageImages, ...pageImages].map((image, index) => (
                <div className="about-image-card" key={`${image}-${index}`}>
                  <Image alt={`CORE X FITNESS premium training area ${index + 1}`} className="object-cover" fill sizes="(min-width: 1024px) 360px, (min-width: 768px) 300px, 230px" src={image} unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="about-reveal py-14 sm:py-24">
        <div className="about-reveal about-card-premium section-shell grid items-center gap-6 rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-5 shadow-card backdrop-blur-xl transition duration-300 hover:border-red-500/40 hover:shadow-red sm:gap-8 sm:rounded-[2rem] sm:p-6 md:grid-cols-[0.45fr_1fr] md:p-8">
          <div className="about-card-premium group relative aspect-[16/12] overflow-hidden rounded-[1.35rem] border border-white/10 sm:aspect-square sm:rounded-[1.5rem]">
            <Image alt="CORE X FITNESS professional trainer preview" className="object-cover transition duration-700 group-hover:scale-105" fill sizes="(min-width: 768px) 360px, 100vw" src={trainerImage} unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-400 sm:text-sm sm:tracking-[0.24em]">Trainer Introduction</p>
            <h2 className="mt-3 text-2xl font-black leading-tight sm:text-5xl">Guidance from coaches who care about form and consistency.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:mt-5 sm:text-base sm:leading-8">
              Our trainer team helps members understand movement, build safer routines, and stay accountable as they progress.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
