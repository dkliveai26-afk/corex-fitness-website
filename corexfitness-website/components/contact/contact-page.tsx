"use client";

import { ContactForm } from "@/components/contact/contact-form";
import { ContactLenisScroll } from "@/components/contact/contact-lenis-scroll";
import { buildWhatsAppHref, GYM_PHONE_NUMBER, GYM_WHATSAPP_HREF } from "@/components/site/contact-info";
import { PageShell } from "@/components/site/page-shell";
import { useWebsiteContent } from "@/lib/website-content-client";

const contactCards = [
  {
    title: "Gym Address",
    value: "Kolkata, West Bengal, India",
    note: "Easy access from the main road"
  },
  {
    title: "Phone Number",
    value: GYM_PHONE_NUMBER,
    note: "Call for membership queries"
  },
  {
    title: "Email",
    value: "hello@corexfitness.com",
    note: "We usually reply within 24 hours"
  },
  {
    title: "Working Hours",
    value: "Mon - Sat: 5:00 AM - 11:00 PM",
    note: "Sunday: 7:00 AM - 8:00 PM"
  }
];

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    className: "text-[#1877F2] hover:border-[#1877F2] hover:bg-[#1877F2]/12",
    icon: (
      <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.2 8.2V6.7c0-.7.5-.9 1-.9h2.2V2.2L14.3 2C10.8 2 9 4.1 9 7.8v.4H6.4V12H9v10h4.1V12h3.3l.5-3.8h-3.8Z" />
      </svg>
    )
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    className: "text-[#E4405F] hover:border-[#E4405F] hover:bg-[#E4405F]/12",
    icon: (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <rect height="16" rx="5" stroke="currentColor" strokeWidth="2.2" width="16" x="4" y="4" />
        <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="17.3" cy="6.8" fill="currentColor" r="1.1" />
      </svg>
    )
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    className: "text-[#FF0000] hover:border-[#FF0000] hover:bg-[#FF0000]/12",
    icon: (
      <svg aria-hidden="true" className="size-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5a3 3 0 0 0-2.1 2.1C2 9 2 12 2 12s0 3 .4 4.8a3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1C22 15 22 12 22 12s0-3-.4-4.8ZM10 15.4V8.6l5.8 3.4L10 15.4Z" />
      </svg>
    )
  },
  {
    label: "WhatsApp",
    href: GYM_WHATSAPP_HREF,
    className: "text-[#25D366] hover:border-[#25D366] hover:bg-[#25D366]/12",
    icon: (
      <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.1 2A9.8 9.8 0 0 0 3.6 16.7L2.4 21.9l5.3-1.4A9.8 9.8 0 1 0 12.1 2Zm0 17.8a8 8 0 0 1-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.3a8 8 0 1 1 6.9 3.8Zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.4-.8-1.9-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.8-.9 2s.9 2.4 1 2.5c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.1 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .2-1.1-.1-.2-.3-.3-.5-.4Z" />
      </svg>
    )
  }
];

export function ContactPage() {
  const { content } = useWebsiteContent();
  const section = content.sections.contact;
  const activeContactCards = content.contact.cards.filter((card) => card.enabled);
  const displayedContactCards = activeContactCards.length ? activeContactCards : contactCards;
  const mapSrc = content.contact.mapSrc || "https://www.google.com/maps?q=Kolkata,West+Bengal,India&output=embed";
  const displayedSocials = content.socialLinks.filter((social) => social.enabled);

  return (
    <PageShell>
      <ContactLenisScroll />
      <section className="contact-reveal section-shell pt-8 pb-5 text-center sm:pt-12 sm:pb-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-400 sm:text-sm">{section.eyebrow}</p>
        <h1 className="mt-1 text-3xl font-black leading-tight sm:text-5xl">
          {section.title}
        </h1>
        <p className="mx-auto mt-3 max-w-[20rem] text-sm leading-7 text-zinc-300 sm:max-w-2xl sm:text-base">
          {section.subtitle}
        </p>
      </section>

      <section className="section-shell pb-14">
        <div className="grid gap-6 xl:grid-cols-[0.82fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {displayedContactCards.map((card) => (
              <article
                className="contact-card-reveal contact-reveal rounded-2xl border border-white/10 bg-[#111217]/95 p-5 shadow-card backdrop-blur-xl transition hover:-translate-y-1 hover:border-red-500/60 hover:shadow-red"
                key={card.title}
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-400">{card.title}</p>
                {card.title === "Phone Number" ? (
                  <a
                    className="contact-card-value mt-2 block break-words text-xl font-black leading-tight"
                    href={buildWhatsAppHref("Hello CORE X FITNESS, I want to contact the gym.")}
                  >
                    {card.value}
                  </a>
                ) : (
                  <p className="contact-card-value mt-2 break-words text-xl font-black leading-tight">{card.value}</p>
                )}
                <p className="mt-2 text-sm leading-6 text-zinc-400">{card.note}</p>
              </article>
            ))}
          </div>

          <div className="contact-card-reveal contact-reveal">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Protected Google Map section: keep this permanently on the Contact page. */}
      <section className="contact-reveal bg-zinc-900/70 py-16" id="map">
        <div className="section-shell grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="contact-card-reveal contact-reveal h-[300px] overflow-hidden rounded-xl border border-white/10 bg-[#111217] shadow-card sm:h-[400px]">
            <iframe
              allowFullScreen
              className="block h-full w-full rounded-xl"
              height="400"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapSrc}
              style={{ border: 0, borderRadius: "12px" }}
              title="CORE X FITNESS Google Map - Kolkata, West Bengal, India"
              width="100%"
            />
          </div>

          <article className="contact-card-reveal contact-reveal relative self-center overflow-hidden rounded-[1.75rem] border border-red-500/25 bg-[radial-gradient(circle_at_16%_10%,rgba(239,68,68,0.16),transparent_18rem),linear-gradient(145deg,rgba(24,24,27,0.98),rgba(9,9,11,0.98))] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.42)] sm:p-7">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />
            <p className="text-xs font-black uppercase tracking-[0.26em] text-red-300 sm:text-sm">Visit Us</p>
            <h2 className="mt-2 text-[2rem] font-black leading-[1.05] text-white sm:text-4xl">{content.contact.visitTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-300 sm:max-w-[26rem]">
              {content.contact.visitSubtitle}
            </p>
            <div className="mt-4 grid gap-2 text-xs leading-tight text-zinc-300 sm:text-sm">
              {content.contact.visitNotes.map((note) => (
                <p className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2" key={note}>{note}</p>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="contact-reveal section-shell py-20">
        <div className="contact-card-reveal contact-reveal rounded-[2rem] border border-white/10 bg-[#111217]/95 p-7 text-center shadow-card sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-red-400">Social</p>
          <h2 className="mt-3 text-3xl font-black sm:text-5xl">Connect with us</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(displayedSocials.length ? displayedSocials : socials.map(({ href, label }) => ({ enabled: true, href, id: label.toLowerCase(), label }))).map((social) => {
              const socialMeta = getContactSocialMeta(social.label);

              return (
              <a
                aria-label={social.label}
                className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-4 text-center text-sm font-black uppercase tracking-wide transition hover:-translate-y-1 hover:shadow-red ${socialMeta.className}`}
                href={social.href}
                key={social.id}
                rel="noreferrer"
                target="_blank"
                title={social.label}
              >
                {socialMeta.icon}
                <span className="text-white">{social.label}</span>
              </a>
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function getContactSocialMeta(label: string) {
  const normalizedLabel = label.toLowerCase();
  return socials.find((social) => normalizedLabel.includes(social.label.toLowerCase()) || social.label.toLowerCase().includes(normalizedLabel)) || socials[0];
}
