import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isConfiguredAdminCredential } from "@/lib/admin-access";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Access Denied" }, { status: 403 });
  }

  const formData = await request.formData();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");

  if (!isConfiguredAdminCredential(currentPassword) || newPassword.length < 8) {
    return NextResponse.json({ error: "Access Denied" }, { status: 400 });
  }

  const envPath = path.join(process.cwd(), ".env.local");
  let envContent = "";

  try {
    envContent = await fs.readFile(envPath, "utf8");
  } catch {
    envContent = "";
  }

  const escapedPassword = JSON.stringify(newPassword);
  const nextEnvContent = envContent.match(/^ADMIN_PASSWORD=/m)
    ? envContent.replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${escapedPassword}`)
    : `${envContent.trimEnd()}\nADMIN_PASSWORD=${escapedPassword}\n`;

  await fs.writeFile(envPath, nextEnvContent);
  process.env.ADMIN_PASSWORD = newPassword;

  return NextResponse.json({ ok: true });
}
