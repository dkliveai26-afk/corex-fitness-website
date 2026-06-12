"use client";

import { createContext, FormEvent, ReactNode, useContext, useEffect, useRef, useState } from "react";
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
import { usePathname } from "next/navigation";
import { bootFirebaseClient, firebaseAuth } from "@/lib/firebase-client";
import { saveFirebaseAuthUser } from "@/lib/firebase-auth-users";

type AuthMode = "login" | "signup";

type AuthContextValue = {
  authUser: User | null;
  isAuthReady: boolean;
  openAuthModal: (mode?: AuthMode, reason?: string) => void;
  requireAuth: (action?: () => void, reason?: string) => boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const authPopupDismissedKey = "core-x-fitness:auth-popup-dismissed";

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [reason, setReason] = useState("Login or sign up to continue with CORE X FITNESS.");
  const pendingActionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    bootFirebaseClient()
      .then(() => {
        unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
          const nextUser = user && !user.isAnonymous ? user : null;
          setAuthUser(nextUser);
          setIsAuthReady(true);

          if (nextUser && pendingActionRef.current) {
            const action = pendingActionRef.current;
            pendingActionRef.current = null;
            setIsModalOpen(false);
            window.setTimeout(action, 80);
          }
        });
      })
      .catch(() => setIsAuthReady(true));

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!isAuthReady || authUser) return;
    if (pathname.startsWith("/private-admin") || pathname === "/login" || pathname === "/signup") return;
    if (window.sessionStorage.getItem(authPopupDismissedKey) === "1") return;

    const timer = window.setTimeout(() => {
      setReason("Login or sign up for bookings and membership updates.");
      setMode("login");
      setIsModalOpen(true);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [authUser, isAuthReady, pathname]);

  function openAuthModal(nextMode: AuthMode = "login", nextReason = "Login or sign up to continue.") {
    setMode(nextMode);
    setReason(nextReason);
    setIsModalOpen(true);
  }

  function closeAuthModal() {
    pendingActionRef.current = null;
    window.sessionStorage.setItem(authPopupDismissedKey, "1");
    setIsModalOpen(false);
  }

  function requireAuth(action?: () => void, nextReason = "Please login or sign up before booking your plan.") {
    if (authUser) {
      action?.();
      return true;
    }

    pendingActionRef.current = action || null;
    openAuthModal("login", nextReason);
    return false;
  }

  async function logout() {
    await signOut(firebaseAuth);
    setAuthUser(null);
  }

  return (
    <AuthContext.Provider value={{ authUser, isAuthReady, logout, openAuthModal, requireAuth }}>
      {children}
      {isModalOpen ? (
        <AuthPromptModal
          mode={mode}
          reason={reason}
          setMode={setMode}
          onAuthenticated={() => {
            window.sessionStorage.setItem(authPopupDismissedKey, "1");
            setIsModalOpen(false);
          }}
          onClose={closeAuthModal}
        />
      ) : null}
    </AuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useFirebaseAuth must be used within AuthProvider");
  }

  return context;
}

function AuthPromptModal({
  mode,
  onAuthenticated,
  onClose,
  reason,
  setMode
}: {
  mode: AuthMode;
  onAuthenticated: () => void;
  onClose: () => void;
  reason: string;
  setMode: (mode: AuthMode) => void;
}) {
  const isSignup = mode === "signup";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResetMessage("");
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

      await saveFirebaseAuthUser(credential.user, fullName);
      onAuthenticated();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setResetMessage("");
    setIsSubmitting(true);

    try {
      await setPersistence(firebaseAuth, browserLocalPersistence);
      const credential = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      await saveFirebaseAuthUser(credential.user);
      onAuthenticated();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    const email = emailValue.trim();
    setError("");
    setResetMessage("");

    if (!email) {
      setError("Enter your email address first.");
      emailInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      await setPersistence(firebaseAuth, browserLocalPersistence);
      await sendPasswordResetEmail(firebaseAuth, email);
      setResetMessage("Password reset email sent. Check your inbox.");
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md" role="dialog" aria-modal="true">
      <div className="my-6 w-full max-w-md rounded-[1.5rem] border border-white/10 bg-[#111217]/95 p-5 shadow-card sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Member Access</p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-white">Login to continue</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{reason}</p>
          </div>
          <button
            aria-label="Close auth popup"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-xl font-bold text-white transition hover:border-red-400 hover:bg-red-600"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
          {(["login", "signup"] as const).map((item) => (
            <button
              className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wide transition ${
                mode === item ? "bg-red-600 text-white shadow-red" : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
              }`}
              key={item}
              onClick={() => {
                setError("");
                setResetMessage("");
                setMode(item);
              }}
              type="button"
            >
              {item === "login" ? "Email Login" : "Sign Up"}
            </button>
          ))}
        </div>

        <button
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white transition hover:border-red-400 hover:bg-white/[0.09]"
          disabled={isSubmitting}
          onClick={handleGoogleSignIn}
          type="button"
        >
          <span className="grid size-6 place-items-center rounded-full bg-white text-sm font-black text-zinc-950">G</span>
          Google Sign In
        </button>

        <form className="mt-4 grid gap-3" onSubmit={handleEmailSubmit}>
          {isSignup ? (
            <input
              className="contact-input"
              name="fullName"
              placeholder="Full name"
              required
              type="text"
            />
          ) : null}
          <input
            autoComplete="email"
            className="contact-input"
            name="email"
            onChange={(event) => setEmailValue(event.target.value)}
            placeholder="Email address"
            ref={emailInputRef}
            required
            type="email"
            value={emailValue}
          />
          <input
            autoComplete={isSignup ? "new-password" : "current-password"}
            className="contact-input"
            minLength={6}
            name="password"
            placeholder="Password"
            required
            type="password"
          />
          {!isSignup ? (
            <button
              className="justify-self-end text-xs font-bold text-red-300 transition hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              onClick={handlePasswordReset}
              type="button"
            >
              Forgot Password?
            </button>
          ) : null}
          {resetMessage ? (
            <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-200">
              {resetMessage}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm font-semibold text-red-200">
              {error}
            </p>
          ) : null}
          <button className="button-gradient rounded-2xl px-5 py-3 text-sm font-black uppercase" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Please wait..." : isSignup ? "Create Account" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

function getAuthErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";

  if (code === "auth/popup-closed-by-user") return "Google sign-in was closed before completion.";
  if (code === "auth/email-already-in-use") return "This email is already registered. Please login.";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password") return "Invalid email or password.";
  if (code === "auth/user-not-found") return "No account found with this email.";
  if (code === "auth/invalid-email" || code === "auth/missing-email") return "Enter a valid email address.";
  if (code === "auth/weak-password") return "Password should be at least 6 characters.";
  if (code === "auth/operation-not-allowed") return "Enable this sign-in provider in Firebase Authentication.";
  if (code === "auth/network-request-failed") return "Network error. Please check your connection.";

  return "Authentication failed. Please try again.";
}
