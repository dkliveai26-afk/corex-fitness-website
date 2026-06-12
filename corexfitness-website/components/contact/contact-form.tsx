"use client";

import { FormEvent, useState } from "react";
import { buildWhatsAppHref, GYM_PHONE_NUMBER } from "@/components/site/contact-info";
import { notifyAdmin } from "@/lib/client-notifications";
import { addContactLead, addWhatsAppLead } from "@/lib/gym-management-store";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: ""
};

type ContactFormState = typeof initialForm;

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});

  function updateField(field: keyof ContactFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateForm() {
    const nextErrors: Partial<Record<keyof ContactFormState, string>> = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!/^[0-9+\-\s()]{7,16}$/.test(form.phone.trim())) {
      nextErrors.phone = "Enter a valid phone number.";
    }
    if (!form.subject.trim()) {
      nextErrors.subject = "Subject is required.";
    }
    if (form.message.trim().length < 10) {
      nextErrors.message = "Message must be at least 10 characters.";
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      addContactLead({
        email: form.email,
        name: form.fullName,
        phone: form.phone,
        subject: form.subject,
        message: `${form.subject}: ${form.message}`
      });
      addWhatsAppLead({
        userName: form.fullName,
        phoneNumber: form.phone,
        planSelected: "Contact inquiry",
        message: form.message
      });
      notifyAdmin({
        type: "contact",
        subject: `New Contact Message - ${form.fullName}`,
        details: {
          Name: form.fullName,
          Phone: form.phone,
          Email: form.email,
          Subject: form.subject,
          Message: form.message
        }
      });
      window.location.href = buildWhatsAppHref(
        `Name: ${form.fullName}\nPhone: ${form.phone}\nEmail: ${form.email}\nSubject: ${form.subject}\nMessage: ${form.message}`
      );
    }
  }

  function clearForm() {
    setForm(initialForm);
    setErrors({});
  }

  return (
    <form className="rounded-[1.5rem] border border-white/10 bg-[#111217]/95 p-5 shadow-card backdrop-blur-xl sm:p-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField error={errors.fullName} label="Full Name">
          <input
            className="contact-input"
            onChange={(event) => updateField("fullName", event.target.value)}
            placeholder="Your name"
            type="text"
            value={form.fullName}
          />
        </FormField>

        <FormField error={errors.email} label="Email">
          <input
            className="contact-input"
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={form.email}
          />
        </FormField>

        <FormField error={errors.phone} label="Phone Number">
          <input
            className="contact-input"
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder={GYM_PHONE_NUMBER}
            type="tel"
            value={form.phone}
          />
        </FormField>

        <FormField error={errors.subject} label="Subject">
          <input
            className="contact-input"
            onChange={(event) => updateField("subject", event.target.value)}
            placeholder="Membership query"
            type="text"
            value={form.subject}
          />
        </FormField>
      </div>

      <div className="mt-4">
        <FormField error={errors.message} label="Message">
          <textarea
            className="contact-input min-h-28 resize-y"
            onChange={(event) => updateField("message", event.target.value)}
            placeholder="Tell us how we can help..."
            value={form.message}
          />
        </FormField>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          className="rounded-full bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-red transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
          type="submit"
        >
          Send Message
        </button>
        <button
          className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:border-red-400 hover:bg-white/[0.08]"
          onClick={clearForm}
          type="button"
        >
          Clear Form
        </button>
      </div>
    </form>
  );
}

function FormField({
  children,
  error,
  label
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-300">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {error ? <span className="mt-2 block text-sm font-semibold text-red-300">{error}</span> : null}
    </label>
  );
}
