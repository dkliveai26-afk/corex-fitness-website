export type MembershipStatus = "active" | "inactive" | "expired" | "paused";

export type PaymentStatus = "paid" | "unpaid" | "pending" | "cash_on_gym";

export type BookingStatus = "submitted" | "confirmed" | "cancelled" | "completed";

export type PaymentMethod = "cash" | "google_pay" | "phonepe" | "paytm" | "upi" | "card" | "bank_transfer" | "not_selected";

export type MemberData = {
  memberId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  profileImage?: string;
  age: number;
  gender: string;
  selectedPlan: string;
  joiningDate: string;
  membershipStartDate: string;
  membershipEndDate: string;
  membershipStatus: MembershipStatus;
  paymentStatus: PaymentStatus;
  feesAmount?: number;
  notes?: string;
};

export type BookingData = {
  bookingId: string;
  userName: string;
  phoneNumber?: string;
  email?: string;
  selectedPlan: string;
  bookingDate: string;
  bookingTime?: string;
  bookingStatus: BookingStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  feesAmount?: number;
};

export type PaymentData = {
  paymentId: string;
  bookingId?: string;
  memberName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDate: string;
  paymentNumber?: string;
  transactionNote?: string;
};

export type ContactLeadData = {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  contactDate: string;
};

export type WhatsAppLeadData = {
  userName: string;
  phoneNumber: string;
  planSelected: string;
  message: string;
  date: string;
};

export type GymSheetRowData = {
  rowId: string;
  memberName: string;
  phone: string;
  email: string;
  plan: string;
  joinDate: string;
  endDate: string;
  paymentStatus: PaymentStatus;
  feesAmount: number;
  notes: string;
};

export type GymDataStore = {
  members: MemberData[];
  bookings: BookingData[];
  payments: PaymentData[];
  contactLeads: ContactLeadData[];
  whatsAppLeads: WhatsAppLeadData[];
  gymSheetRows?: GymSheetRowData[];
  settings?: GymSettingsData;
};

export type GymSettingsData = {
  adminEmail: string;
  gymName: string;
  gymPhoneNumber: string;
  whatsAppNumber: string;
};

export const emptyGymDataStore: GymDataStore = {
  members: [],
  bookings: [],
  payments: [],
  contactLeads: [],
  whatsAppLeads: [],
  gymSheetRows: [],
  settings: undefined
};
