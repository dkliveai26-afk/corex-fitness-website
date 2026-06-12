import { FirebaseAuthForm } from "@/components/auth/firebase-auth-form";
import { PageShell } from "@/components/site/page-shell";

export default function SignupPage() {
  return (
    <PageShell>
      <section className="grid min-h-screen place-items-center px-6 py-28 sm:py-32">
        <FirebaseAuthForm mode="signup" />
      </section>
    </PageShell>
  );
}
