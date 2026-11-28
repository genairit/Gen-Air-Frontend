const estimateFormatter = new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" });
export const formatBoqEstimate = (value: string) => estimateFormatter.format(Number(value));
