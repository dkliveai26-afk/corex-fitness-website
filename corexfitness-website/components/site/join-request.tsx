"use client";

import { createContext, FormEvent, ReactNode, useContext, useEffect, useState } from "react";
import { buildWhatsAppHref, GYM_PHONE_NUMBER } from "@/components/site/contact-info";
import { notifyAdmin } from "@/lib/client-notifications";
import { addContactLead, addWhatsAppLead } from "@/lib/gym-management-store";

const initialJoinForm = {
  fullName: "",
  phone: "",
  email: "",
  age: "",
  gender: "",
  joiningDate: "",
  payAtGym: false
};

type JoinForm = typeof initialJoinForm;
type JoinField = keyof JoinForm;

type JoinRequestContextValue = {
  openJoinRequest: () => void;
};

const JoinRequestContext = createContext<JoinRequestContextValue | null>(null);

export function JoinRequestProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<JoinForm>(initialJoinForm);
  const [errors, setErrors] = useState<Partial<Record<JoinField, string>>>({});

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

  function openJoinRequest() {
    setIsOpen(true);
    setErrors({});
  }

  function closeJoinRequest() {
    setIsOpen(false);
    setForm(initialJoinForm);
    setErrors({});
  }

  function updateField(field: JoinField, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateForm() {
    const nextErrors: Partial<Record<JoinField, string>> = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!/^[0-9+\-\s()]{7,16}$/.test(form.phone.trim())) nextErrors.phone = "Enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!form.age.trim() || Number(form.age) < 12 || Number(form.age) > 90) nextErrors.age = "Enter an age between 12 and 90.";
    if (!form.gender) nextErrors.gender = "Select gender.";
    if (!form.joiningDate) nextErrors.joiningDate = "Select joining date.";
    if (!form.payAtGym) nextErrors.payAtGym = "Confirm payment at the gym.";

    return nextErrors;
  }

  function submitJoinRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      addContactLead({
        email: form.email,
        name: form.fullName,
        phone: form.phone,
        subject: "Join Now",
        message: `Join request. Email: ${form.email}. Joining Date: ${form.joiningDate}. Payment: pay at gym.`
      });
      addWhatsAppLead({
        userName: form.fullName,
        phoneNumber: form.phone,
        planSelected: "Join Now",
        message: "I want to join CORE X FITNESS. I will pay at the gym."
      });
      notifyAdmin({
        type: "join",
        subject: `New Join Request - ${form.fullName}`,
        details: {
          Name: form.fullName,
          Phone: form.phone,
          Email: form.email,
          Age: form.age,
          Gender: form.gender,
          "Joining Date": form.joiningDate,
          Payment: "Pay at gym"
        }
      });
      window.location.href = buildWhatsAppHref(
        `Name: ${form.fullName}\nPhone: ${form.phone}\nEmail: ${form.email}\nAge: ${form.age}\nGender: ${form.gender}\nJoining Date: ${form.joiningDate}\nMessage: I want to join CORE X FITNESS. I will pay at the gym.`
      );
    }
  }

  return (
    <JoinRequestContext.Provider value={{ openJoinRequest }}>
      {children}

      {isOpen ? (
        <div className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <form
            className="my-6 w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#111217] p-5 shadow-card sm:p-7"
            onSubmit={submitJoinRequest}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Join CORE X FITNESS</p>
                <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">Start your membership request</h2>
              </div>
              <button
                aria-label="Cancel joining request"
                className="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-xl font-bold text-white transition hover:border-red-400 hover:bg-red-600"
                onClick={closeJoinRequest}
                type="button"
              >
                x
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <JoinFieldControl error={errors.fullName} label="Full Name">
                <input className="contact-input" onChange={(event) => updateField("fullName", event.target.value)} placeholder="Your full name" type="text" value={form.fullName} />
              </JoinFieldControl>

              <JoinFieldControl error={errors.phone} label="Phone Number">
                <input className="contact-input" onChange={(event) => updateField("phone", event.target.value)} placeholder={GYM_PHONE_NUMBER} type="tel" value={form.phone} />
              </JoinFieldControl>

              <JoinFieldControl error={errors.email} label="Email">
                <input className="contact-input" onChange={(event) => updateField("email", event.target.value)} placeholder="you@example.com" type="email" value={form.email} />
              </JoinFieldControl>

              <JoinFieldControl error={errors.age} label="Age">
                <input className="contact-input" max="90" min="12" onChange={(event) => updateField("age", event.target.value)} placeholder="25" type="number" value={form.age} />
              </JoinFieldControl>

              <JoinFieldControl error={errors.gender} label="Gender">
                <select className="contact-input" onChange={(event) => updateField("gender", event.target.value)} value={form.gender}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </JoinFieldControl>

              <JoinFieldControl error={errors.joiningDate} label="Joining Date">
                <input className="contact-input" onChange={(event) => updateField("joiningDate", event.target.value)} type="date" value={form.joiningDate} />
              </JoinFieldControl>
            </div>

            <label className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <input
                checked={form.payAtGym}
                className="mt-1 size-4 accent-red-600"
                onChange={(event) => updateField("payAtGym", event.target.checked)}
                type="checkbox"
              />
              <span className="min-w-0">
                <span className="block text-sm font-black text-white">I will pay at the gym</span>
                <span className="mt-1 block text-sm leading-6 text-zinc-400">
                  You can complete payment directly at the gym with the manager.
                </span>
                {errors.payAtGym ? <span className="mt-2 block text-sm font-semibold text-red-300">{errors.payAtGym}</span> : null}
              </span>
            </label>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                className="inline-flex justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:-translate-y-0.5 hover:bg-red-500"
                type="submit"
              >
                Join Now
              </button>
              <button
                className="inline-flex justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:border-red-400 hover:bg-white/[0.08]"
                onClick={closeJoinRequest}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

    </JoinRequestContext.Provider>
  );
}

export function useJoinRequestModal() {
  const context = useContext(JoinRequestContext);

  if (!context) {
    throw new Error("useJoinRequestModal must be used within JoinRequestProvider");
  }

  return context;
}

export function JoinNowButton({ className, label = "Join Now" }: { className: string; label?: string }) {
  const { openJoinRequest } = useJoinRequestModal();

  return (
    <button className={className} onClick={openJoinRequest} type="button">
      {label}
    </button>
  );
}

function JoinFieldControl({
  children,
  error,
  label
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-black uppercase tracking-[0.16em] text-zinc-300">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error ? <span className="mt-2 block text-sm font-semibold text-red-300">{error}</span> : null}
    </label>
  );
}
