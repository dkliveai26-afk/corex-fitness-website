export const GYM_PHONE_NUMBER = "8709304727";

const phoneDigits = GYM_PHONE_NUMBER.replace(/[^\d+]/g, "");

export const GYM_WHATSAPP_HREF = `https://wa.me/91${phoneDigits}`;

export function buildWhatsAppHref(message: string) {
  return `${GYM_WHATSAPP_HREF}?text=${encodeURIComponent(message)}`;
}
