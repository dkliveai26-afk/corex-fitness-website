"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent } from "react";
import { buildWhatsAppHref, GYM_PHONE_NUMBER } from "@/components/site/contact-info";
import { PageShell } from "@/components/site/page-shell";
import type { Trainer } from "@/components/trainers/trainer-data";
import { addWhatsAppLead } from "@/lib/gym-management-store";
import { useWebsiteContent } from "@/lib/website-content-client";

export function TrainerProfilePage({ requestedSlug, trainer: initialTrainer }: { requestedSlug?: string; trainer: Trainer }) {
  const { content } = useWebsiteContent();
  const trainer = content.trainers.find((item) => item.enabled && item.slug === (requestedSlug || initialTrainer.slug)) || initialTrainer;
  const achievements = [
    { label: "Members Trained", value: trainer.membersTrained },
    { label: "Experience Years", value: trainer.experience },
    { label: "Certifications", value: trainer.certificationCount }
  ];
  const trainerEmail = `${trainer.slug}@corexfitness.com`;

  function sendTrainerMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const message = String(data.get("message") || "");

    addWhatsAppLead({
      userName: name,
      phoneNumber: GYM_PHONE_NUMBER,
      planSelected: `Trainer: ${trainer.name}`,
      message: `${email}: ${message}`
    });
    window.location.href = buildWhatsAppHref(
      `Name: ${name}\nEmail: ${email}\nTrainer: ${trainer.name}\nMessage: ${message}`
    );
  }

  return (
    <PageShell>
      <section className="section-shell pt-24 pb-8 sm:pt-28 sm:pb-10">
        <Link
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:border-red-400 hover:bg-white/[0.08]"
          href="/trainers"
        >
          <span aria-hidden="true">&larr;</span>
          Back
        </Link>
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#111217]/95 shadow-card">
          <div className="relative min-h-[220px] overflow-hidden sm:min-h-[280px] lg:min-h-[300px]">
            <Image
              alt={`${trainer.name} profile`}
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src={trainer.image}
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111217] via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400 sm:text-sm">
                {trainer.specialization}
              </p>
              <h1 className="mt-1.5 text-3xl font-black leading-tight sm:text-4xl">{trainer.name}</h1>
              <p className="mt-2 inline-flex rounded-full border border-red-500/35 bg-red-600/15 px-3.5 py-1.5 text-xs font-black text-red-100 sm:text-sm">
                {trainer.experience}
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <a
                  className="inline-flex justify-center rounded-full bg-red-600 px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-red transition hover:-translate-y-0.5 hover:bg-red-500 sm:text-sm"
                  href={buildWhatsAppHref(`Message: I want to contact trainer ${trainer.name}.`)}
                >
                  Contact Trainer
                </a>
                <a
                  className="inline-flex justify-center rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:border-red-400 hover:bg-white/15 sm:text-sm"
                  href={buildWhatsAppHref(`Message: I want to message trainer ${trainer.name}.`)}
                  title={GYM_PHONE_NUMBER}
                >
                  Message Trainer
                </a>
              </div>
            </div>
          </div>

          <div className="grid items-start gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_0.68fr]">
            <div className="min-w-0">
              <div className="text-xl font-black sm:text-2xl">About Trainer</div>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{trainer.intro}</p>

              <div className="mt-4">
                <div className="text-base font-black sm:text-lg">Certifications</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {trainer.certifications.map((certification) => (
                    <span
                      className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-zinc-200"
                      key={certification}
                    >
                      {certification}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-base font-black sm:text-lg">Fitness Skills</div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {trainer.skills.map((skill) => (
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-300" key={skill}>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-base font-black sm:text-lg">Expertise</div>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {trainer.expertise.map((item) => (
                    <li className="flex items-start gap-2 text-sm text-zinc-200" key={item}>
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-red-600/20 text-red-300 ring-1 ring-red-500/35">
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
                      <span className="min-w-0 leading-5">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="min-w-0">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                <div className="text-lg font-black">Contact Trainer</div>
                <div className="mt-2.5 grid gap-2">
                  <a
                    className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-sm text-zinc-200 transition hover:border-red-500/50 hover:bg-white/[0.07]"
                    href={buildWhatsAppHref(`Message: I want to contact trainer ${trainer.name}.`)}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-red-600/20 text-red-300 ring-1 ring-red-500/35">
                      <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.3 19.3 0 0 1-6-6A19.7 19.7 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block font-black">Phone</span>
                      <span className="block break-words text-zinc-400">{GYM_PHONE_NUMBER}</span>
                    </span>
                  </a>
                  <a
                    className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-sm text-zinc-200 transition hover:border-red-500/50 hover:bg-white/[0.07]"
                    href={`mailto:${trainerEmail}`}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-red-600/20 text-red-300 ring-1 ring-red-500/35">
                      <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M4 4h16v16H4z" />
                        <path d="m22 6-10 7L2 6" />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block font-black">Email</span>
                      <span className="block break-words text-zinc-400">{trainerEmail}</span>
                    </span>
                  </a>
                </div>
              </div>

              <form className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-3.5" id="message-trainer" onSubmit={sendTrainerMessage}>
                <div className="text-lg font-black">Message Trainer</div>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">Name</span>
                    <input className="contact-input mt-1 !rounded-xl !px-3 !py-2.5 text-sm" name="name" placeholder="Your name" type="text" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">Email</span>
                    <input className="contact-input mt-1 !rounded-xl !px-3 !py-2.5 text-sm" name="email" placeholder="you@example.com" type="email" />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">Message</span>
                    <textarea className="contact-input mt-1 min-h-16 resize-y !rounded-xl !px-3 !py-2.5 text-sm" name="message" placeholder={`Message ${trainer.name}`} />
                  </label>
                </div>
                <button
                  className="mt-3 w-full rounded-full bg-red-600 px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-red transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-zinc-950 sm:text-sm"
                  type="submit"
                >
                  Send Message
                </button>
              </form>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {achievements.map((achievement) => (
                  <article className="min-w-0 rounded-xl border border-white/10 bg-white/[0.05] p-2.5" key={achievement.label}>
                    <span className="block text-lg font-black leading-none text-red-500">{achievement.value}</span>
                    <span className="mt-1 block max-w-full break-words text-[9px] font-black uppercase leading-tight tracking-[0.03em] text-zinc-400 sm:text-[10px]">
                      {achievement.label}
                    </span>
                  </article>
                ))}
              </div>

              <Link
                className="mt-3 inline-flex w-full justify-center rounded-full bg-red-600 px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-red transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-zinc-950 sm:text-sm"
                href="/trainers"
              >
                Back to Trainers
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
}


