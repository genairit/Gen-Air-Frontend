export const PAYMENT_TERMS = {
  OTHER: "other",
  PREPAID: "prepaid",
  MILESTONES_NET_60: "milestones_net_60",
  INSTALLMENTS_10_60_30: "installments_10_60_30",
  TWELVE_PREPAID_CHECKS: "twelve_prepaid_checks",
} as const;

export type PaymentTermsType = (typeof PAYMENT_TERMS)[keyof typeof PAYMENT_TERMS];

export const PAYMENT_TERMS_VALUES: PaymentTermsType[] = Object.values(PAYMENT_TERMS);
export const PAYMENT_STAGES_LABEL = "לפי שלבי תשלום";

interface IPaymentTermsCopy {
  title: string;
  subtitle: string;
}

export const PAYMENT_TERMS_LABELS: Record<PaymentTermsType, IPaymentTermsCopy> = {
  prepaid: { title: "תשלום מראש", subtitle: "תשלום אחד לפני תחילת העבודה" },
  other: { title: "אחר", subtitle: "תנאים מותאמים אישית" },
  installments_10_60_30: { title: "10-60-30", subtitle: "תשלום בשלבים" },
  twelve_prepaid_checks: { title: "12 צ׳קים מראש", subtitle: "12 שיקים במעמד ההזמנה" },
  milestones_net_60: {
    title: "לפי אבני דרך (שוטף + 60)",
    subtitle: "תשלום לפי התקדמות הפרויקט",
  },
};
