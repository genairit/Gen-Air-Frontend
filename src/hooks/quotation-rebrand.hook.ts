import { useRef, useState } from "react";
import type { IQuotation } from "../interfaces/quotation.interface";
import { rebrandQuotationAction } from "../actions/quotation-rebrand.action";

interface IQuotationRebrandOptions {
  blocked: boolean;
  quotation: IQuotation;
  confirmBlocked?: boolean;
  onChange: (quotation: IQuotation) => void;
}
interface IQuotationRebrandState {
  busy: boolean;
  cancel: () => void;
  error: string | null;
  pendingBrand: string | null;
  confirm: () => Promise<void>;
  request: (brand: string) => void;
}
export const useQuotationRebrand = ({
  quotation,
  blocked,
  confirmBlocked = false,
  onChange,
}: IQuotationRebrandOptions): IQuotationRebrandState => {
  const [pendingBrand, setPendingBrand] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const request = (brand: string): void => {
    if (inFlight.current || blocked) {
      return;
    }
    setError(null);
    if (quotation.sections.some(section => section.items.length)) {
      setPendingBrand(brand);
      return;
    }
    onChange({ ...quotation, brand });
  };
  const confirm = async (): Promise<void> => {
    if (pendingBrand === null || inFlight.current || blocked || confirmBlocked) {
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      onChange(await rebrandQuotationAction(quotation, pendingBrand));
      setPendingBrand(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "החלפת החברה נכשלה");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const cancel = (): void => {
    if (!inFlight.current) {
      setPendingBrand(null);
    }
  };
  return { pendingBrand, error, busy, request, confirm, cancel };
};
