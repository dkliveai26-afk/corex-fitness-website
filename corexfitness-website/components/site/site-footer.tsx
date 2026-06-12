"use client";

import { Footer } from "@/components/site/footer";
import { useWebsiteContent } from "@/lib/website-content-client";

export function SiteFooter() {
  const { content } = useWebsiteContent();
  const footerEmail = content.footer.email || content.contact.cards.find((card) => card.id === "email")?.value || "hello@corexfitness.com";

  return (
    <Footer
      address={content.footer.address}
      brandName={content.footer.brandName}
      copyright={content.footer.copyright}
      description={content.footer.description}
      email={footerEmail}
      logoSrc={content.footer.logoSrc || "/images/navbar-logo-fit.png"}
      phone={content.footer.phone}
      socialLinks={content.socialLinks}
    />
  );
}
