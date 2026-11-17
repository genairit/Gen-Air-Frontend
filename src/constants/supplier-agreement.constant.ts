import type { ISupplierInput } from "../interfaces/supplier-agreement.interface";

export const EMPTY_SUPPLIER_INPUT: ISupplierInput = {
  name: "",
  contactName: "",
  phone: "",
  email: "",
  notes: "",
  active: true,
};

export const SUPPLIER_CURRENCY_OPTIONS = ["ILS", "USD", "EUR"];
