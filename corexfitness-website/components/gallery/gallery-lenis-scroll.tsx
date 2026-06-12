"use client";

import { useLayoutEffect } from "react";
import Lenis from "lenis";

export function GalleryLenisScroll() {
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      anchors: true,
      autoResize: true,
      easing: (time) => 1 - Math.pow(1 - time, 4),
      lerp: 0.058,
      overscroll: false,
      smoothWheel: true,
      touchMultiplier: 1,
      wheelMultiplier: 0.72
    });

    let frameId = 0;
    let observeFrameId = 0;
    let observeFrameIdSecond = 0;
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(".gallery-reveal"));

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    document.documentElement.classList.add("gallery-lenis-active");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("gallery-reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -6% 0px",
        threshold: 0.08
      }
    );

    let cardIndex = 0;
    revealItems.forEach((item, index) => {
      const isCard = item.classList.contains("gallery-card-reveal");
      const delay = isCard ? 80 + (cardIndex++ % 8) * 55 : Math.min(index * 16, 64);
      item.style.setProperty("--gallery-reveal-delay", `${delay}ms`);
    });

    frameId = requestAnimationFrame(raf);
    observeFrameId = requestAnimationFrame(() => {
      observeFrameIdSecond = requestAnimationFrame(() => {
        revealItems.forEach((item) => observer.observe(item));
      });
    });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(observeFrameId);
      cancelAnimationFrame(observeFrameIdSecond);
      lenis.destroy();
      revealItems.forEach((item) => {
        item.classList.remove("gallery-reveal-visible");
        item.style.removeProperty("--gallery-reveal-delay");
      });
      document.documentElement.classList.remove("gallery-lenis-active");
    };
  }, []);

  return null;
}
