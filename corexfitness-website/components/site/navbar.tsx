"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { routes } from "@/components/site/data";
import { useJoinRequestModal } from "@/components/site/join-request";

export function Navbar() {
  const pathname = usePathname();
  const isAboutPage = pathname === "/about";
  const [isOpen, setIsOpen] = useState(false);
  const { openJoinRequest } = useJoinRequestModal();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isRouteActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-xl">
      <nav className="section-shell flex min-h-14 items-center justify-between gap-3 sm:min-h-16 sm:gap-4 lg:min-h-[4.25rem]">
        <Link className="flex min-w-0 items-center gap-3 lg:-ml-8 xl:-ml-10" href="/">
          <span className="grid h-11 w-44 shrink-0 place-items-center rounded-md text-xs font-black sm:h-14 sm:w-60 sm:text-sm lg:h-16 lg:w-72">
            <img
              alt="CORE X FITNESS logo"
              className="block h-[88%] w-[88%] object-contain object-center"
              src="/images/navbar-logo-fit.png"
            />
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-semibold text-zinc-300 lg:flex">
          {routes.map((route) => {
            const isActive = isRouteActive(route.href);

            return (
              <Link
                className={`group relative inline-flex items-center py-2 transition duration-300 ease-out hover:text-red-400 ${
                  isActive ? "text-red-500" : ""
                }`}
                href={route.href}
                key={route.href}
              >
                <span>{route.label}</span>
                <span
                  className={`absolute bottom-1 left-0 h-0.5 w-full origin-left rounded-full bg-red-500 transition-transform duration-300 ease-out ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            className={`rounded-md bg-red-600 font-black uppercase tracking-wide text-white shadow-red transition hover:-translate-y-0.5 hover:bg-red-500 ${
              isAboutPage ? "px-3 py-2 text-xs sm:px-5 sm:py-3 sm:text-sm" : "px-4 py-3 text-sm sm:px-5"
            }`}
            onClick={openJoinRequest}
            type="button"
          >
            Join Now
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <button
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white transition hover:border-red-400 hover:bg-white/[0.1]"
            onClick={() => setIsOpen((current) => !current)}
            type="button"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition duration-300 ${
                  isOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition duration-300 ${
                  isOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-5 rounded-full bg-current transition duration-300 ${
                  isOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 top-16 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 sm:top-20 lg:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`ml-auto flex h-[calc(100vh-4rem)] w-[min(86vw,22rem)] flex-col border-l border-white/10 bg-zinc-950/95 p-5 shadow-card transition duration-300 sm:h-[calc(100vh-5rem)] ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Menu</p>
            <button
              aria-label="Close navigation menu"
              className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-xl font-bold text-white transition hover:border-red-400 hover:bg-red-600"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              x
            </button>
          </div>

          <div className="mt-6 grid gap-2">
            {routes.map((route) => {
              const isActive = isRouteActive(route.href);

              return (
                <Link
                  className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-wide transition ${
                    isActive
                      ? "border-white/10 bg-white/[0.04] text-red-400"
                      : "border-white/10 bg-white/[0.04] text-zinc-200 hover:border-red-400/60 hover:text-red-300"
                  }`}
                  href={route.href}
                  key={route.href}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{route.label}</span>
                  <span
                    className={`absolute bottom-2 left-4 h-0.5 w-[calc(100%-2rem)] origin-left rounded-full bg-red-500 transition-transform duration-300 ease-out ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          <button
            className="mt-5 inline-flex justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:bg-red-500"
            onClick={() => {
              setIsOpen(false);
              openJoinRequest();
            }}
            type="button"
          >
            Join Now
          </button>
        </div>
      </div>
    </header>
  );
}
