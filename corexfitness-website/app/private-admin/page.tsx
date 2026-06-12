import { redirect } from "next/navigation";
import { AdminDashboardDesign } from "@/components/admin-dashboard/admin-dashboard-design";
import { requireAdmin } from "@/lib/auth";

export default async function PrivateAdmin({
  searchParams
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  await searchParams;
  if (!(await requireAdmin())) redirect("/private-admin/login?reauth=1");

  return <AdminDashboardDesign />;
}
