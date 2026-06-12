"use client";

import { GallerySection } from "@/components/gallery/gallery-grid";
import { GalleryLenisScroll } from "@/components/gallery/gallery-lenis-scroll";
import { galleryImages } from "@/components/gallery/gallery-data";
import { PageShell } from "@/components/site/page-shell";
import { useWebsiteContent } from "@/lib/website-content-client";

export function GalleryPage() {
  const { content } = useWebsiteContent();
  const section = content.sections.gallery;
  const activeImages = content.gallery.filter((image) => image.enabled);
  const displayedImages = activeImages.length ? activeImages : galleryImages;
  const galleryCategories = Array.from(new Set(displayedImages.map((image) => image.category)));

  return (
    <PageShell>
      <GalleryLenisScroll />
      <section className="gallery-reveal section-shell pt-8 pb-5 text-center sm:pt-12 sm:pb-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-400 sm:text-sm">{section.eyebrow}</p>
        <h1 className="mt-1 text-3xl font-black leading-tight sm:text-5xl">
          {section.title}
        </h1>
        <p className="mx-auto mt-3 max-w-[20rem] text-sm leading-7 text-zinc-300 sm:max-w-2xl sm:text-base">
          {section.subtitle}
        </p>
      </section>

      <section className="gallery-reveal section-shell pb-10">
        <div className="flex flex-wrap justify-center gap-3">
          {galleryCategories.map((category) => (
            <span
              className="gallery-card-reveal gallery-reveal rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase tracking-wide text-zinc-200"
              key={category}
            >
              {category}
            </span>
          ))}
        </div>
      </section>

      <section className="section-shell pb-24">
        <div className="grid gap-12">
          {galleryCategories.map((category) => {
            const images = displayedImages.filter((image) => image.category === category);

            return (
              <GallerySection images={images} key={category} title={category} />
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
