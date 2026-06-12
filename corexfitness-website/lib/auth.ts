import crypto from "node:crypto";
import { cookies } from "next/headers";
import { isConfiguredAdminIdentity } from "@/lib/admin-access";

const cookieName = "admin_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;

function getSecret() {
  return process.env.SESSION_SECRET || "development-only-change-me";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createSessionToken(username: string) {
  const payload = Buffer.from(
    JSON.stringify({ username, exp: Date.now() + sessionMaxAgeSeconds * 1000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || sign(payload) !== signature) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      username: string;
      exp: number;
    };
    return isConfiguredAdminIdentity(parsed.username) && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const token = (await cookies()).get(cookieName)?.value;
  return verifySessionToken(token);
}

export { cookieName, sessionMaxAgeSeconds };
