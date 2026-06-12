import { galleryImages } from "@/components/gallery/gallery-data";
import { trainers } from "@/components/trainers/trainer-data";
import { images } from "@/components/site/data";

export type EditableSection = {
  enabled: boolean;
  eyebrow: string;
  subtitle: string;
  title: string;
};

export type EditableHero = {
  image: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  subtitle: string;
  title: string;
};

export type EditableOffer = {
  discountText: string;
  enabled: boolean;
  eyebrow: string;
  id: string;
  image: string;
  offerPercent?: string;
  text: string;
  title: string;
};

export type EditablePlan = {
  badge?: string;
  buttonText?: string;
  description: string;
  duration: string;
  enabled: boolean;
  features: string[];
  id: string;
  mrpPrice?: string;
  name: string;
  offerPercent?: string;
  price: string;
};

export type EditableGalleryImage = {
  alt: string;
  category: string;
  enabled: boolean;
  id: string;
  size: "standard" | "tall" | "wide";
  src: string;
};

export type EditableTrainer = {
  certificationCount: string;
  certifications: string[];
  description: string;
  enabled: boolean;
  experience: string;
  expertise: string[];
  image: string;
  intro: string;
  membersTrained: string;
  name: string;
  price: string;
  skills: string[];
  slug: string;
  specialization: string;
};

export type EditableDietPlan = {
  calories: string;
  description: string;
  enabled: boolean;
  id: string;
  image: string;
  meals: string;
  protein: string;
  title: string;
};

export type EditableContactCard = {
  enabled: boolean;
  id: string;
  note: string;
  title: string;
  value: string;
};

export type EditableSocialLink = {
  enabled: boolean;
  href: string;
  id: string;
  label: string;
};

export type WebsiteContent = {
  about: {
    differenceTitle: string;
    differences: string[];
    heroImage: string;
    heroSubtitle: string;
    heroTitle: string;
    images: string[];
    values: { text: string; title: string }[];
  };
  contact: {
    cards: EditableContactCard[];
    mapSrc: string;
    visitNotes: string[];
    visitSubtitle: string;
    visitTitle: string;
  };
  dietPlans: EditableDietPlan[];
  footer: {
    address: string;
    brandName: string;
    copyright: string;
    description: string;
    email: string;
    logoSrc: string;
    phone: string;
  };
  gallery: EditableGalleryImage[];
  hero: EditableHero;
  offers: EditableOffer[];
  plans: EditablePlan[];
  sections: Record<"home" | "about" | "plans" | "trainers" | "gallery" | "diet" | "contact", EditableSection>;
  socialLinks: EditableSocialLink[];
  trainers: EditableTrainer[];
  updatedAt?: string;
};

export const defaultWebsiteContent: WebsiteContent = {
  about: {
    differenceTitle: "Why our gym feels different",
    differences: [
      "Premium equipment arranged for smooth, efficient workouts.",
      "Trainer-led guidance that keeps technique and progression clear.",
      "A clean, high-energy atmosphere built around consistency.",
      "Flexible training support for beginners and experienced athletes."
    ],
    heroImage: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1600&q=90",
    heroSubtitle:
      "CORE X FITNESS brings together modern training equipment, knowledgeable coaches, and a focused environment for members who want to train with purpose.",
    heroTitle: "A premium gym built around progress, discipline, and community.",
    images: [
      "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1600&q=90",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=90"
    ],
    values: [
      {
        text: "To help every member build strength, discipline, and confidence through focused coaching and a world-class training environment.",
        title: "Our Mission"
      },
      {
        text: "To become the most trusted fitness destination for people who want sustainable progress, not short-term hype.",
        title: "Our Vision"
      }
    ]
  },
  contact: {
    cards: [
      { enabled: true, id: "address", note: "Easy access from the main road", title: "Gym Address", value: "Kolkata, West Bengal, India" },
      { enabled: true, id: "phone", note: "Call for membership queries", title: "Phone Number", value: "8709304727" },
      { enabled: true, id: "email", note: "We usually reply within 24 hours", title: "Email", value: "hello@corexfitness.com" },
      { enabled: true, id: "hours", note: "Sunday: 7:00 AM - 8:00 PM", title: "Working Hours", value: "Mon - Sat: 5:00 AM - 11:00 PM" }
    ],
    mapSrc: "https://www.google.com/maps?q=Kolkata,West+Bengal,India&output=embed",
    visitNotes: ["Landmark: Near Metro Gate 2", "Parking: Available for members", "Reception: Open during working hours"],
    visitSubtitle: "Drop by our front desk for membership details, gym tours, trainer availability, and nutrition consultation information.",
    visitTitle: "Kolkata, West Bengal"
  },
  dietPlans: [
    {
      calories: "1,600",
      description: "Clean meals for steady fat loss.",
      enabled: true,
      id: "weight-loss",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=90",
      meals: "5",
      protein: "110g",
      title: "Weight Loss Diet"
    },
    {
      calories: "2,800",
      description: "Protein-rich meals for lean mass.",
      enabled: true,
      id: "muscle-gain",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=90",
      meals: "6",
      protein: "170g",
      title: "Muscle Gain Diet"
    },
    {
      calories: "1,900",
      description: "Balanced food for fat control.",
      enabled: true,
      id: "fat-loss",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=90",
      meals: "5",
      protein: "140g",
      title: "Fat Loss Diet"
    },
    {
      calories: "2,500",
      description: "Fuel for lifting and recovery.",
      enabled: true,
      id: "strength",
      image: "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=1200&q=90",
      meals: "5",
      protein: "160g",
      title: "Strength Diet"
    },
    {
      calories: "2,000",
      description: "Simple meals for beginners.",
      enabled: true,
      id: "beginner",
      image: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=1200&q=90",
      meals: "4",
      protein: "120g",
      title: "Beginner Diet"
    },
    {
      calories: "3,200",
      description: "High-energy meals for athletes.",
      enabled: true,
      id: "athlete",
      image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=1200&q=90",
      meals: "6",
      protein: "190g",
      title: "Athlete Diet"
    }
  ],
  footer: {
    address: "24 Iron Street, Fitness District",
    brandName: "CORE X FITNESS",
    copyright: "\u00a9 2026 CORE X FITNESS. All rights reserved.",
    description: "Premium training, disciplined coaching, and a gym floor made for steady progress.",
    email: "hello@corexfitness.com",
    logoSrc: "/images/navbar-logo-fit.png",
    phone: "8709304727"
  },
  gallery: galleryImages.map((image, index) => ({
    ...image,
    enabled: true,
    id: `gallery-${index + 1}`
  })),
  hero: {
    image: images.hero,
    primaryButtonText: "Join Now",
    secondaryButtonText: "View Plans",
    subtitle: "Train in a high-performance fitness space built for strength, stamina, discipline, and lasting confidence.",
    title: "Transform Your Body, Transform Your Life"
  },
  offers: [
    {
      discountText: "20% OFF",
      enabled: true,
      eyebrow: "Freedom Fitness Deal",
      id: "independence-day",
      image: "",
      offerPercent: "20",
      text: "on yearly membership",
      title: "Independence Day Offer"
    }
  ],
  plans: [
    {
      buttonText: "Book Now",
      description: "Ideal for beginners starting a consistent fitness routine.",
      duration: "1 Month",
      enabled: true,
      features: ["Gym Access", "Cardio Access", "Basic Support", "Locker Access", "Fitness Assessment"],
      id: "beginner-plan",
      mrpPrice: "2000",
      name: "Beginner Plan",
      offerPercent: "20",
      price: "1600"
    },
    {
      badge: "Most Popular",
      buttonText: "Book Now",
      description: "Everything you need to train stronger with coach support.",
      duration: "3 Months",
      enabled: true,
      features: ["Gym Access", "Cardio Access", "Weight Training", "Trainer Support", "Diet Guidance"],
      id: "standard-plan",
      mrpPrice: "2499",
      name: "Standard Plan",
      offerPercent: "20",
      price: "1999"
    },
    {
      badge: "Best Value",
      buttonText: "Book Now",
      description: "Tailored training support for complete body transformation.",
      duration: "6 Months",
      enabled: true,
      features: ["Gym Access", "Cardio Access", "Weight Training", "Personal Trainer", "Diet Guidance"],
      id: "premium-plan",
      mrpPrice: "4999",
      name: "Premium Plan",
      offerPercent: "20",
      price: "3999"
    }
  ],
  sections: {
    about: {
      enabled: true,
      eyebrow: "About CORE X FITNESS",
      subtitle: "CORE X FITNESS brings together modern training equipment, knowledgeable coaches, and a focused environment for members who want to train with purpose.",
      title: "A premium gym built around progress, discipline, and community."
    },
    contact: {
      enabled: true,
      eyebrow: "Contact",
      subtitle: "Get in touch with us for any questions or membership information",
      title: "Contact CORE X FITNESS"
    },
    diet: {
      enabled: true,
      eyebrow: "Nutrition",
      subtitle: "Healthy nutrition plans for your fitness goals",
      title: "Fitness Diet & Nutrition"
    },
    gallery: {
      enabled: true,
      eyebrow: "Gallery",
      subtitle: "Take a look inside our gym environment and facilities",
      title: "CORE X FITNESS Gallery"
    },
    home: {
      enabled: true,
      eyebrow: "Premium Gym Experience",
      subtitle: "Train in a high-performance fitness space built for strength, stamina, discipline, and lasting confidence.",
      title: "Transform Your Body, Transform Your Life"
    },
    plans: {
      enabled: true,
      eyebrow: "Membership",
      subtitle: "Choose the perfect fitness plan for your goals",
      title: "Plans for every fitness starting point"
    },
    trainers: {
      enabled: true,
      eyebrow: "Our Team",
      subtitle: "Train with experienced fitness experts",
      title: "Meet Our Expert Trainers"
    }
  },
  socialLinks: [
    { enabled: true, href: "https://www.instagram.com/", id: "instagram", label: "Instagram" },
    { enabled: true, href: "https://www.facebook.com/", id: "facebook", label: "Facebook" },
    { enabled: true, href: "https://www.youtube.com/", id: "youtube", label: "YouTube" },
    { enabled: true, href: "https://x.com/", id: "x", label: "X" }
  ],
  trainers: trainers.map((trainer) => ({
    ...trainer,
    enabled: true,
    price: ""
  }))
};

export function mergeWebsiteContent(input?: Partial<WebsiteContent> | null): WebsiteContent {
  if (!input) return defaultWebsiteContent;

  return {
    ...defaultWebsiteContent,
    ...input,
    about: { ...defaultWebsiteContent.about, ...input.about },
    contact: {
      ...defaultWebsiteContent.contact,
      ...input.contact,
      cards: Array.isArray(input.contact?.cards) ? input.contact.cards : defaultWebsiteContent.contact.cards,
      visitNotes: Array.isArray(input.contact?.visitNotes) ? input.contact.visitNotes : defaultWebsiteContent.contact.visitNotes
    },
    dietPlans: Array.isArray(input.dietPlans) ? input.dietPlans : defaultWebsiteContent.dietPlans,
    footer: { ...defaultWebsiteContent.footer, ...input.footer },
    gallery: Array.isArray(input.gallery) ? input.gallery : defaultWebsiteContent.gallery,
    hero: { ...defaultWebsiteContent.hero, ...input.hero },
    offers: Array.isArray(input.offers) ? input.offers.map(normalizeOffer) : defaultWebsiteContent.offers,
    plans: Array.isArray(input.plans) ? input.plans.map(normalizePlan) : defaultWebsiteContent.plans,
    sections: {
      ...defaultWebsiteContent.sections,
      ...input.sections
    },
    socialLinks: Array.isArray(input.socialLinks) ? input.socialLinks : defaultWebsiteContent.socialLinks,
    trainers: Array.isArray(input.trainers) ? input.trainers : defaultWebsiteContent.trainers
  };
}

export function createContentId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizePlan(plan: EditablePlan): EditablePlan {
  const mrpPrice = plan.mrpPrice || plan.price || "0";
  const offerPercent = plan.offerPercent || "20";
  const finalPrice = calculateFinalPrice(mrpPrice, offerPercent);
  return {
    ...plan,
    buttonText: plan.buttonText || "Book Now",
    mrpPrice,
    offerPercent,
    price: String(finalPrice || getNumericPrice(plan.price))
  };
}

function normalizeOffer(offer: EditableOffer): EditableOffer {
  const offerPercent = offer.offerPercent || String(getNumericPrice(offer.discountText) || 20);
  return {
    ...offer,
    discountText: `${Math.min(100, Math.max(0, getNumericPrice(offerPercent)))}% OFF`,
    offerPercent
  };
}

function calculateFinalPrice(mrpPrice: string, offerPercent: string) {
  const mrp = getNumericPrice(mrpPrice);
  const offer = Math.min(100, Math.max(0, getNumericPrice(offerPercent)));
  return Math.round(mrp - (mrp * offer / 100));
}

function getNumericPrice(value?: string) {
  const numericValue = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
}
