import type { PaymentTermsType } from "../constants/payment-terms.constant";

export interface IPaymentStage {
  text: string;
  percent: string;
}
export interface IPaymentConfiguration {
  paymentSchedule: IPaymentStage[];
  paymentTerms: PaymentTermsType | null;
}
export interface IPaymentConfigurationSource {
  paymentSchedule?: IPaymentStage[];
  paymentTerms?: PaymentTermsType | null;
}
export interface IPaymentStageChange {
  index: number;
  changes: Partial<IPaymentStage>;
  configuration: IPaymentConfiguration;
}

export interface IPaymentConfigurationChoice {
  id: string;
  label: string;
  selected: boolean;
  configuration: IPaymentConfiguration;
}
export interface IPaymentConfigurationChoiceOptions {
  allowUnset: boolean;
  customLabel: string;
  value: IPaymentConfiguration;
  termsOptions: PaymentTermsType[];
}
