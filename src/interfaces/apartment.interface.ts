import type { ChipVariantType } from "../constants/chip.constant";
import type { IValidationResult } from "./validation-result.interface";
import type { TFieldType } from "../components/TextField/constants/textfield.constants";

export interface IApartmentFormValues {
  floor: string;
  contactName: string;
  contactPhone: string;
  customerName: string;
  customerPhone: string;
  apartmentNumber: string;
}

export type ApartmentFormFieldType = keyof IApartmentFormValues;

export interface IApartmentFormFieldConfig {
  label: string;
  type: TFieldType;
  isRequired: boolean;
  placeholder: string;
  field: ApartmentFormFieldType;
  validate: (value: string) => IValidationResult;
}

export type TInheritanceSourceType = "building" | "overridden" | "own";

export interface IInheritanceBadgeConfig {
  label: string;
  description: string;
  variant: ChipVariantType;
}

export interface IApartmentPosition {
  total: number;
  position: number;
  nextId: string | null;
  previousId: string | null;
}

export interface IApartmentSelection {
  toggleAll: () => void;
  isAllSelected: boolean;
  toggle: (apartmentId: string) => void;
  isSelected: (apartmentId: string) => boolean;
}
