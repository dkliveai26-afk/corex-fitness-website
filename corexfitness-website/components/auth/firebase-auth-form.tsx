"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User
} from "firebase/auth";
import { bootFirebaseClient, firebaseAuth } from "@/lib/firebase-client";
import { saveFirebaseAuthUser } from "@/lib/firebase-auth-users";

type AuthMode = "login" | "signup";

export function FirebaseAuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [error, setError] = useState("");
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    bootFirebaseClient()
      .then(() => {
        unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
          setAuthUser(user && !user.isAnonymous ? user : null);
          setIsCheckingSession(false);
        });
      })
      .catch(() => {
        setIsCheckingSession(false);
        setError("Firebase authentication is not available right now.");
      });

    return () => unsubscribe?.();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") || "").trim();
    const email = emailValue.trim();
    const password = String(formData.get("password") || "");

    try {
      await setPersistence(firebaseAuth, browserLocalPersistence);

      const credential = isSignup
        ? await createUserWithEmailAndPassword(firebaseAuth, email, password)
        : await signInWithEmailAndPassword(firebaseAuth, email, password);

      if (isSignup && fullName) {
        await updateProfile(credential.user, { displayName: fullName });
      }

      await saveFirebaseAuthUser(credential.user, isSignup ? fullName : credential.user.displayName || "");
      setAuthUser(credential.user);
      setMessage(isSignup ? "Account created successfully." : "Login successful.");
      router.refresh();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      await signOut(firebaseAuth);
      setAuthUser(null);
      setMessage("Logged out successfully.");
      router.refresh();
    } catch {
      setError("Logout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      await setPersistence(firebaseAuth, browserLocalPersistence);
      const credential = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      await saveFirebaseAuthUser(credential.user);
      setAuthUser(credential.user);
      setMessage("Google login successful.");
      router.refresh();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    const email = emailValue.trim();
    setError("");
    setMessage("");

    if (!email) {
      setError("Enter your email address first.");
      emailInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      await setPersistence(firebaseAuth, browserLocalPersistence);
      await sendPasswordResetEmail(firebaseAuth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) {
    return (
      <div className="glass w-full max-w-md rounded-lg p-6 text-center shadow-card sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-400">Checking session</p>
        <p className="mt-3 text-sm text-zinc-400">Loading secure access...</p>
      </div>
    );
  }

  if (authUser) {
    return (
      <div className="glass w-full max-w-md rounded-lg p-6 shadow-card sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-400">Signed in</p>
        <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
          Welcome{authUser.displayName ? `, ${authUser.displayName}` : ""}
        </h1>
        <p className="mt-3 break-words text-sm leading-6 text-slate-400">{authUser.email}</p>
        {message ? (
          <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>
        ) : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            className="inline-flex justify-center rounded-lg border border-white/15 px-5 py-3 text-sm font-black uppercase transition hover:border-red-400 hover:bg-red-600"
            href="/"
          >
            Website
          </Link>
          <button
            className="button-gradient rounded-lg px-5 py-3 text-sm font-black uppercase"
            disabled={isSubmitting}
            onClick={handleLogout}
            type="button"
          >
            {isSubmitting ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="glass w-full max-w-md rounded-lg p-6 shadow-card sm:p-8" onSubmit={handleSubmit}>
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-400">
        {isSignup ? "Create account" : "Member login"}
      </p>
      <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
        {isSignup ? "Join CORE X FITNESS" : "Login to your account"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        {isSignup
          ? "Create your member account with Firebase Authentication."
          : "Use your registered email and password to continue."}
      </p>

      {isSignup ? (
        <label className="mt-6 block text-sm font-semibold">
          Full Name
          <input
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 outline-none transition focus:border-red-400"
            name="fullName"
            placeholder="Your name"
            required
            type="text"
          />
        </label>
      ) : null}

      <label className={`${isSignup ? "mt-4" : "mt-6"} block text-sm font-semibold`}>
        Email
        <input
          autoComplete="email"
          className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 outline-none transition focus:border-red-400"
          name="email"
          onChange={(event) => setEmailValue(event.target.value)}
          placeholder="you@example.com"
          ref={emailInputRef}
          required
          type="email"
          value={emailValue}
        />
      </label>

      <label className="mt-4 block text-sm font-semibold">
        Password
        <input
          autoComplete={isSignup ? "new-password" : "current-password"}
          className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 outline-none transition focus:border-red-400"
          minLength={6}
          name="password"
          placeholder="Minimum 6 characters"
          required
          type="password"
        />
      </label>

      {!isSignup ? (
        <button
          className="mt-3 block w-full text-right text-xs font-bold text-red-300 transition hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={handlePasswordReset}
          type="button"
        >
          Forgot Password?
        </button>
      ) : null}

      {message ? (
        <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>
      ) : null}

      <button
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-black text-white transition hover:border-red-400 hover:bg-white/[0.08]"
        disabled={isSubmitting}
        onClick={handleGoogleSignIn}
        type="button"
      >
        <span className="grid size-6 place-items-center rounded-full bg-white text-sm font-black text-zinc-950">G</span>
        Google Sign In
      </button>

      <button className="button-gradient mt-3 w-full rounded-lg px-5 py-3 font-bold" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
      </button>

      <p className="mt-5 text-center text-sm text-zinc-400">
        {isSignup ? "Already have an account?" : "Need a new account?"}{" "}
        <Link className="font-bold text-red-300 transition hover:text-red-200" href={isSignup ? "/login" : "/signup"}>
          {isSignup ? "Login" : "Sign up"}
        </Link>
      </p>
    </form>
  );
}

function getAuthErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";

  if (code === "auth/email-already-in-use") return "This email is already registered. Please login.";
  if (code === "auth/popup-closed-by-user") return "Google sign-in was closed before completion.";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password") return "Invalid email or password.";
  if (code === "auth/user-not-found") return "No account found with this email.";
  if (code === "auth/invalid-email" || code === "auth/missing-email") return "Enter a valid email address.";
  if (code === "auth/weak-password") return "Password should be at least 6 characters.";
  if (code === "auth/operation-not-allowed") return "Enable Email/Password sign-in provider in Firebase Authentication.";
  if (code === "auth/network-request-failed") return "Network error. Please check your connection.";

  return "Authentication failed. Please try again.";
}
