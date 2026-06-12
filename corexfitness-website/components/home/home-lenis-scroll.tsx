"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function HomeLenisScroll() {
  useEffect(() => {
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
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(".home-reveal"));

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    document.documentElement.classList.add("home-lenis-active");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("home-reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -6% 0px",
        threshold: 0.08
      }
    );

    revealItems.forEach((item, index) => {
      item.style.setProperty("--home-reveal-delay", `${Math.min(index * 22, 110)}ms`);
      observer.observe(item);
    });

    frameId = requestAnimationFrame(raf);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
      lenis.destroy();
      revealItems.forEach((item) => {
        item.classList.remove("home-reveal-visible");
        item.style.removeProperty("--home-reveal-delay");
      });
      document.documentElement.classList.remove("home-lenis-active");
    };
  }, []);

  return null;
}
