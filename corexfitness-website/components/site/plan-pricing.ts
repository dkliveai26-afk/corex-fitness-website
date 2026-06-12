import type { EditablePlan } from "@/lib/website-content";

type PlanPricing = {
  finalPrice: number;
  mrpPrice: number;
  offerPercent: number;
};

export function getPlanPricing(plan: Pick<EditablePlan, "mrpPrice" | "offerPercent" | "price">): PlanPricing {
  const mrpPrice = getNumber(plan.mrpPrice || plan.price);
  const offerPercent = clampOfferPercent(getNumber(plan.offerPercent || "20"));

  if (!Number.isFinite(mrpPrice) || mrpPrice <= 0) {
    return { finalPrice: 0, mrpPrice: 0, offerPercent };
  }

  return {
    finalPrice: Math.round(mrpPrice - (mrpPrice * offerPercent / 100)),
    mrpPrice: Math.round(mrpPrice),
    offerPercent
  };
}

export function formatPlanCurrency(value: number) {
  return value.toLocaleString("en-IN");
}

function getNumber(value?: string) {
  return Number(String(value || "").replace(/[^\d.]/g, ""));
}

function clampOfferPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}
