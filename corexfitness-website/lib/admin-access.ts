export const configuredAdminIdentity = "core-x-admin";

export function isConfiguredAdminIdentity(identity: string) {
  return identity === configuredAdminIdentity;
}

export function isConfiguredAdminCredential(password: string) {
  return Boolean(process.env.ADMIN_PASSWORD) && password === process.env.ADMIN_PASSWORD;
}
