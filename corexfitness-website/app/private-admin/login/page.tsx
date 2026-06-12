import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/app/private-admin/login/admin-login-form";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLogin({
  searchParams
}: {
  searchParams: Promise<{ error?: string; reauth?: string }>;
}) {
  const params = await searchParams;
  if (params.reauth !== "1" && (await requireAdmin())) redirect("/private-admin");

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <AdminLoginForm hasError={Boolean(params.error)} />
    </main>
  );
}
