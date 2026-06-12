"use client";

import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { trainers, type Trainer } from "@/components/trainers/trainer-data";
import { TrainersLenisScroll } from "@/components/trainers/trainers-lenis-scroll";
import { useWebsiteContent } from "@/lib/website-content-client";
import type { EditableTrainer } from "@/lib/website-content";

const achievements = [
  { label: "Certified Trainers", value: "18+" },
  { label: "Years of Experience", value: "12+" },
  { label: "Members Trained", value: "4,500+" }
];

type TrainerCardData = Trainer | EditableTrainer;

export function TrainersPage() {
  const { content } = useWebsiteContent();
  const section = content.sections.trainers;
  const activeTrainers = content.trainers.filter((trainer) => trainer.enabled);
  const displayedTrainers = activeTrainers.length ? activeTrainers : trainers;

  return (
    <PageShell>
      <TrainersLenisScroll />
      <section className="trainers-reveal section-shell pt-32 pb-14 text-center sm:pt-36">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-red-400">{section.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
          {section.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
          {section.subtitle}
        </p>
      </section>

      <section className="section-shell pb-20">
        <div className="grid justify-center gap-6 md:grid-cols-2 lg:grid-cols-[repeat(3,23rem)]">
          {displayedTrainers.map((trainer) => (
            <TrainerCard key={trainer.slug} trainer={trainer} />
          ))}
        </div>
      </section>

      <section className="trainers-reveal bg-zinc-900/70 py-16">
        <div className="section-shell">
          <div className="grid gap-5 md:grid-cols-3">
            {achievements.map((achievement) => (
              <article
                className="trainers-stat-reveal trainers-reveal group relative overflow-hidden rounded-[1.75rem] border border-red-500/20 bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-7 text-center shadow-card backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-red-400/60 hover:shadow-red"
                key={achievement.label}
              >
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />
                <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-red-500/15 blur-2xl transition duration-300 group-hover:bg-red-500/25" />
                <div className="pointer-events-none absolute -bottom-12 left-1/2 size-32 -translate-x-1/2 rounded-full bg-red-600/10 blur-3xl" />
                <p className="relative mx-auto inline-flex rounded-full border border-red-400/25 bg-red-600/10 px-4 py-1 text-sm font-black text-red-300">
                  {achievement.value}
                </p>
                <p className="relative mt-5 text-2xl font-black uppercase leading-tight tracking-[0.16em] text-zinc-100 sm:text-3xl">
                  {achievement.label}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function TrainerCard({ trainer }: { trainer: TrainerCardData }) {
  return (
    <article className="trainers-card-reveal trainers-reveal group flex h-full min-h-[315px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111217]/95 shadow-card backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-red-500/70 hover:shadow-red lg:h-[29.5rem]">
      <div className="relative -mb-px h-[7.25rem] overflow-hidden bg-[#111217] sm:h-32 lg:h-[12rem]">
        <Image
          alt={`${trainer.name}, ${trainer.specialization} trainer`}
          className="object-cover transition duration-500 group-hover:scale-105"
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          src={trainer.image}
          unoptimized
        />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#111217] via-[#111217]/60 to-transparent" />
      </div>

      <div className="relative z-10 -mt-px flex flex-1 flex-col bg-[#111217] p-3 pt-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-lg font-black leading-tight">{trainer.name}</h2>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-red-400">
              {trainer.specialization}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-red-500/35 bg-red-600/15 px-2.5 py-1 text-[11px] font-black text-red-200">
            {trainer.experience}
          </span>
        </div>

        <p className="mt-1 flex-1 overflow-hidden text-xs leading-5 text-zinc-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{trainer.description}</p>

        <Link
          href={`/trainers/${trainer.slug}`}
          className="mt-2 rounded-full bg-red-600 px-5 py-2 text-xs font-black uppercase tracking-wide text-white shadow-red transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}
