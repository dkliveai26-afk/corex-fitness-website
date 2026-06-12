"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function AboutLenisScroll() {
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
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(".about-reveal"));

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    document.documentElement.classList.add("about-lenis-active");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("about-reveal-visible");
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
      item.style.setProperty("--about-reveal-delay", `${Math.min(index * 22, 110)}ms`);
      observer.observe(item);
    });

    frameId = requestAnimationFrame(raf);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
      lenis.destroy();
      revealItems.forEach((item) => {
        item.classList.remove("about-reveal-visible");
        item.style.removeProperty("--about-reveal-delay");
      });
      document.documentElement.classList.remove("about-lenis-active");
    };
  }, []);

  return null;
}
