"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type GalleryImage = {
  alt: string;
  category: string;
  size: "standard" | "tall" | "wide";
  src: string;
};

export function GalleryGrid({ images }: { images: readonly GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  const closeLightbox = useCallback(() => setActiveIndex(null), []);
  const showNext = useCallback(() => {
    setActiveIndex((current) => (current === null ? 0 : (current + 1) % images.length));
  }, [images.length]);
  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current === null ? images.length - 1 : (current - 1 + images.length) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeLightbox();
      }
      if (event.key === "ArrowRight") {
        showNext();
      }
      if (event.key === "ArrowLeft") {
        showPrevious();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, closeLightbox, showNext, showPrevious]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {images.map((image, index) => (
          <button
            aria-label={`Open ${image.alt}`}
            className="gallery-card-reveal gallery-reveal group relative block aspect-[4/5] w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] text-left shadow-card transition duration-300 hover:-translate-y-1 hover:border-red-500/60 hover:shadow-red sm:rounded-2xl"
            key={`${image.src}-${index}`}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <Image
              alt={image.alt}
              className="object-cover transition duration-500 group-hover:scale-110"
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              src={image.src}
              unoptimized
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-60 transition group-hover:opacity-90" />
            <span className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="inline-flex rounded-full bg-red-600 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                {image.category}
              </span>
            </span>
          </button>
        ))}
      </div>

      {activeImage ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-4 backdrop-blur-xl"
          role="dialog"
        >
          <button
            aria-label="Close image preview"
            className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full border border-white/15 bg-white/10 text-2xl font-bold text-white transition hover:bg-red-600"
            onClick={closeLightbox}
            type="button"
          >
            x
          </button>

          <button
            aria-label="Previous image"
            className="absolute left-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 text-white shadow-card backdrop-blur-md transition hover:border-red-400 hover:bg-red-600 hover:shadow-red sm:left-5 sm:size-12"
            onClick={showPrevious}
            type="button"
          >
            <svg aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div className="relative h-[72vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-card">
            <Image
              alt={activeImage.alt}
              className="object-contain"
              fill
              priority
              sizes="100vw"
              src={activeImage.src}
              unoptimized
            />
          </div>

          <div className="absolute bottom-5 left-1/2 w-[min(92vw,720px)] -translate-x-1/2 rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-red-300">{activeImage.category}</p>
            <p className="mt-1 text-sm text-zinc-200">{activeImage.alt}</p>
          </div>

          <button
            aria-label="Next image"
            className="absolute right-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 text-white shadow-card backdrop-blur-md transition hover:border-red-400 hover:bg-red-600 hover:shadow-red sm:right-5 sm:size-12"
            onClick={showNext}
            type="button"
          >
            <svg aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      ) : null}
    </>
  );
}

export function GallerySection({ images, title }: { images: readonly GalleryImage[]; title: string }) {
  if (images.length === 0) {
    return null;
  }

  return (
    <section className="gallery-reveal">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <h2 className="gallery-section-title shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-center text-xs font-black uppercase tracking-[0.18em] text-red-300">
          {title}
        </h2>
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <GalleryGrid images={images} />
    </section>
  );
}


