import { GYM_PHONE_NUMBER } from "@/components/site/contact-info";

type FooterProps = {
  address?: string;
  brandName?: string;
  copyright?: string;
  description?: string;
  email?: string;
  logoSrc?: string;
  phone?: string;
  socialLinks?: Array<{
    enabled: boolean;
    href: string;
    id: string;
    label: string;
  }>;
};

const defaultSocialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    className: "text-[#E4405F] hover:border-[#E4405F] hover:bg-[#E4405F]/12 hover:shadow-[0_0_22px_rgba(228,64,95,0.3)]",
    icon: (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <rect height="16" rx="5" stroke="currentColor" strokeWidth="2.2" width="16" x="4" y="4" />
        <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="17.3" cy="6.8" fill="currentColor" r="1.1" />
      </svg>
    )
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    className: "text-[#1877F2] hover:border-[#1877F2] hover:bg-[#1877F2]/12 hover:shadow-[0_0_22px_rgba(24,119,242,0.3)]",
    icon: (
      <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.2 8.2V6.7c0-.7.5-.9 1-.9h2.2V2.2L14.3 2C10.8 2 9 4.1 9 7.8v.4H6.4V12H9v10h4.1V12h3.3l.5-3.8h-3.8Z" />
      </svg>
    )
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    className: "text-[#FF0000] hover:border-[#FF0000] hover:bg-[#FF0000]/12 hover:shadow-[0_0_22px_rgba(255,0,0,0.3)]",
    icon: (
      <svg aria-hidden="true" className="size-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5a3 3 0 0 0-2.1 2.1C2 9 2 12 2 12s0 3 .4 4.8a3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1C22 15 22 12 22 12s0-3-.4-4.8ZM10 15.4V8.6l5.8 3.4L10 15.4Z" />
      </svg>
    )
  },
  {
    label: "X",
    href: "https://x.com/",
    className: "text-white hover:border-white/70 hover:bg-white/[0.08] hover:shadow-[0_0_22px_rgba(255,255,255,0.18)]",
    icon: (
      <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.2 10.4 22 2.5h-1.6l-5.9 6.8-4.7-6.8H4.4l7.1 10.3-7.1 8.2H6l6.2-7.2 5 7.2h5.4l-7.4-10.6Zm-2.2 2.5-.7-1L6.6 3.7H9l4.6 6.6.7 1 6 8.6h-2.4L13 12.9Z" />
      </svg>
    )
  }
];

export function Footer({
  address = "24 Iron Street, Fitness District",
  brandName = "CORE X FITNESS",
  copyright,
  description = "Premium training, disciplined coaching, and a gym floor made for steady progress.",
  email = "hello@corexfitness.com",
  logoSrc,
  phone = GYM_PHONE_NUMBER,
  socialLinks = defaultSocialLinks.map(({ href, label }) => ({ enabled: true, href, id: label.toLowerCase(), label }))
}: FooterProps) {
  const visibleSocialLinks = socialLinks.filter((social) => social.enabled);

  return (
    <footer className="border-t border-white/10 bg-black py-12">
      <div className="section-shell grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          {logoSrc ? (
            <img alt={`${brandName} logo`} className="h-14 w-56 object-contain object-left" src={logoSrc} />
          ) : (
            <h2 className="text-2xl font-black uppercase tracking-wide">{brandName}</h2>
          )}
          <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
            {description}
          </p>
        </div>
        <div className="space-y-2 text-sm text-zinc-300">
          <p className="font-black text-white">Contact</p>
          <p>{address}</p>
          <p>{phone}</p>
          <p>{email}</p>
        </div>
        <div>
          <p className="font-black text-white">Social</p>
          <div className="mt-4 flex gap-3">
            {visibleSocialLinks.map((social) => {
              const socialMeta = getSocialMeta(social.label);

              return (
                <a
                  aria-label={social.label}
                  className={`grid size-10 place-items-center rounded-md border border-white/10 bg-white/[0.04] transition duration-300 hover:-translate-y-0.5 ${socialMeta.className}`}
                  href={social.href}
                  key={social.id}
                  rel="noreferrer"
                  target="_blank"
                  title={social.label}
                >
                  {socialMeta.icon}
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <p className="section-shell mt-8 text-sm text-zinc-500">{copyright || `\u00a9 2026 ${brandName}. All rights reserved.`}</p>
    </footer>
  );
}

function getSocialMeta(label: string) {
  const normalizedLabel = label.toLowerCase();
  return defaultSocialLinks.find((social) => normalizedLabel.includes(social.label.toLowerCase()) || social.label.toLowerCase().includes(normalizedLabel)) || defaultSocialLinks[0];
}
