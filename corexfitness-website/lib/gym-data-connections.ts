import type {
  BookingData,
  ContactLeadData,
  MemberData,
  PaymentData,
  WhatsAppLeadData
} from "@/lib/gym-data-models";

export type GymDataEntity =
  | "members"
  | "bookings"
  | "payments"
  | "contactLeads"
  | "whatsAppLeads"
  | "userDashboard"
  | "adminDashboard"
  | "joinNow";

export type GymDataConnection<TSource extends GymDataEntity, TTarget extends GymDataEntity> = {
  source: TSource;
  target: TTarget;
  purpose: string;
  status: "prepared_only";
};

export type BookingToMemberConnection = GymDataConnection<"bookings", "members"> & {
  sourceData: BookingData;
  targetData: Partial<MemberData>;
};

export type JoinNowToLeadConnection = GymDataConnection<"joinNow", "contactLeads"> & {
  targetData: ContactLeadData;
};

export type ContactFormToLeadConnection = GymDataConnection<"contactLeads", "contactLeads"> & {
  targetData: ContactLeadData;
};

export type WhatsAppToLeadConnection = GymDataConnection<"whatsAppLeads", "contactLeads"> & {
  sourceData: WhatsAppLeadData;
  targetData: ContactLeadData;
};

export type DashboardToMemberConnection = GymDataConnection<"userDashboard" | "adminDashboard", "members"> & {
  targetData: MemberData;
};

export type AdminToBookingConnection = GymDataConnection<"adminDashboard", "bookings"> & {
  targetData: BookingData;
};

export type AdminToPaymentConnection = GymDataConnection<"adminDashboard", "payments"> & {
  targetData: PaymentData;
};

export const gymDataConnectionMap = {
  bookingToMembers: {
    source: "bookings",
    target: "members",
    purpose: "Future confirmed bookings can create or update member records.",
    status: "prepared_only"
  },
  joinNowToLeads: {
    source: "joinNow",
    target: "contactLeads",
    purpose: "Future Join Now submissions can be stored as leads before conversion.",
    status: "prepared_only"
  },
  contactFormToLeads: {
    source: "contactLeads",
    target: "contactLeads",
    purpose: "Future contact form submissions can be stored as general leads.",
    status: "prepared_only"
  },
  whatsAppContactToLeads: {
    source: "whatsAppLeads",
    target: "contactLeads",
    purpose: "Future WhatsApp interactions can be tracked as lead records.",
    status: "prepared_only"
  },
  userDashboardToMembers: {
    source: "userDashboard",
    target: "members",
    purpose: "Future user dashboards can read member profile and membership data.",
    status: "prepared_only"
  },
  adminDashboardToMembers: {
    source: "adminDashboard",
    target: "members",
    purpose: "Future admin dashboard can manage member records.",
    status: "prepared_only"
  },
  adminDashboardToBookings: {
    source: "adminDashboard",
    target: "bookings",
    purpose: "Future admin dashboard can review and manage booking records.",
    status: "prepared_only"
  },
  adminDashboardToPayments: {
    source: "adminDashboard",
    target: "payments",
    purpose: "Future admin dashboard can track payments, pending fees, and revenue.",
    status: "prepared_only"
  }
} as const;
