"use client";

import { useState } from "react";

export function AdminLoginForm({ hasError }: { hasError: boolean }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action="/api/admin/login" className="glass w-full max-w-md rounded-lg p-6 shadow-card sm:p-8" method="post">
      <img
        alt="CORE X FITNESS logo"
        className="mb-5 h-14 w-56 object-contain object-left"
        src="/images/navbar-logo-fit.png"
      />
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-400">Private Admin</p>
      <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Secure dashboard</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        This route is intentionally separate from public navigation. The password is read from environment variables.
      </p>
      {hasError && (
        <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
          Access Denied
        </p>
      )}
      <label className="mt-6 block text-sm font-semibold">
        Password
        <span className="relative mt-2 block">
          <input className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 pr-12 outline-none" name="password" required type={showPassword ? "text" : "password"} />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-3 grid place-items-center text-slate-300 transition hover:text-white"
            onClick={() => setShowPassword((current) => !current)}
            type="button"
          >
            {showPassword ? (
              <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17.94 17.94A10.8 10.8 0 0 1 12 20C7 20 2.73 16.89 1 12a11.5 11.5 0 0 1 5.06-5.94" />
                <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
                <path d="m3 3 18 18" />
                <path d="M14.12 5.18A10.9 10.9 0 0 1 23 12a11.6 11.6 0 0 1-2.87 4.19" />
              </svg>
            ) : (
              <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </span>
      </label>
      <button className="button-gradient mt-6 w-full rounded-lg px-5 py-3 font-bold" type="submit">
        Enter Dashboard
      </button>
    </form>
  );
}
