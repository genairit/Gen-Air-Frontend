import {
  PROJECT_DETAIL_FIELD_SETS,
  type ProjectDetailFieldSetType,
} from "./project-detail-field-set.constant";

export const PAYMENT_TERMS = {
  OTHER: "other",
  PREPAID: "prepaid",
  MILESTONES_NET_60: "milestones_net_60",
  INSTALLMENTS_10_60_30: "installments_10_60_30",
  TWELVE_PREPAID_CHECKS: "twelve_prepaid_checks",
} as const;

export type PaymentTermsType = (typeof PAYMENT_TERMS)[keyof typeof PAYMENT_TERMS];

export const PAYMENT_TERMS_VALUES: PaymentTermsType[] = Object.values(PAYMENT_TERMS);

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

const BUSINESS_PAYMENT_TERMS: PaymentTermsType[] = [
  PAYMENT_TERMS.MILESTONES_NET_60,
  PAYMENT_TERMS.TWELVE_PREPAID_CHECKS,
  PAYMENT_TERMS.OTHER,
];

export const PAYMENT_TERMS_BY_FIELD_SET: Record<ProjectDetailFieldSetType, PaymentTermsType[]> = {
  [PROJECT_DETAIL_FIELD_SETS.COMPANY]: BUSINESS_PAYMENT_TERMS,
  [PROJECT_DETAIL_FIELD_SETS.INSTITUTION]: BUSINESS_PAYMENT_TERMS,
  [PROJECT_DETAIL_FIELD_SETS.PRIVATE_CLIENT]: [
    PAYMENT_TERMS.INSTALLMENTS_10_60_30,
    PAYMENT_TERMS.PREPAID,
    PAYMENT_TERMS.OTHER,
  ],
};

export const PAYMENT_TERMS_COPY = {
  TITLE: "תנאי תשלום",
  NOTE_LABEL: "פירוט תנאי התשלום",
  REQUIRED: "בחר תנאי תשלום",
  SUBTITLE: "האפשרויות משתנות לפי סוג הפרויקט",
  NOTE_HINT: "התנאים המותאמים יועברו לאישור מנהל לפני יצירת הצעת מחיר",
  NOTE_PLACEHOLDER: "לדוגמה: 30% מקדמה, 40% בסיום התקנה, 30% שוטף + 30",
  RESET_NOTICE: "סוג הפרויקט השתנה ואפשרויות התשלום השתנו — בחר תנאי תשלום מחדש",
} as const;
