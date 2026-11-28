import {
  QUOTATION_BRANDS,
  QUOTATION_SYSTEM,
  QUOTATION_SYSTEM_OPTIONS,
} from "../../../constants/quotation.constant";

import type {
  IQuotation,
  TQuotationSystem,
  IQuotationSection,
} from "../../../interfaces/quotation.interface";

import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import { Box } from "@mui/material";
import Button from "./QuotationButton";
import QuotationInput from "./QuotationInput";
import QuotationSelect from "./QuotationSelect";
import styles from "../quotation-items.module.css";
import { useState, type FC, type FormEvent } from "react";
import { BUTTON_TYPES } from "../../../constants/button-type.constant";
import { addQuotationBrand } from "../../../utilities/quotation.utility";
import { quotationFloors, assignSectionFloor } from "../../../utilities/quotation-floor.utility";

interface IQuotationSystemFormProps {
  disabled: boolean;
  onClose: () => void;
  quotation: IQuotation;
  section?: IQuotationSection;
  onSave: (next: IQuotation, sectionId: string) => void;
}
const QuotationSystemForm: FC<IQuotationSystemFormProps> = ({
  disabled,
  quotation,
  section,
  onClose,
  onSave,
}) => {
  const [brand, setBrand] = useState(section ? (section.brand ?? "") : (quotation.brands[0] ?? ""));
  const [title, setTitle] = useState(section?.title ?? "");
  const [system, setSystem] = useState<TQuotationSystem>(
    section?.systemType ?? QUOTATION_SYSTEM.VRF,
  );
  const [floorId, setFloorId] = useState(section?.floorId ?? "");
  const [newFloorName, setNewFloorName] = useState("");
  const floors = quotationFloors(quotation.sections);
  const brands = [...new Set([...quotation.brands, ...QUOTATION_BRANDS])];
  const createFloor = Boolean(brand) && floorId === "new";
  const valid = !createFloor || Boolean(newFloorName.trim());
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!valid || disabled) {
      return;
    }
    const floor = createFloor
      ? { floorId: crypto.randomUUID(), floorName: newFloorName.trim() }
      : floors.find(item => item.floorId === floorId);
    const next: IQuotationSection = {
      id: section?.id ?? crypto.randomUUID(),
      title: title.trim(),
      brand: brand || null,
      systemType: brand ? system : QUOTATION_SYSTEM.GENERAL,
      floorId: brand ? (floor?.floorId ?? null) : null,
      floorName: brand ? (floor?.floorName ?? null) : null,
      items: section?.items ?? [],
    };
    const draft = addQuotationBrand(quotation, brand);
    onSave(
      section ? assignSectionFloor(draft, next) : { ...draft, sections: [...draft.sections, next] },
      next.id,
    );
  };

  return (
    <Box
      onSubmit={save}
      component="form"
      className={styles.form}
      aria-label={section ? "עריכת מערכת" : "הוספת מערכת"}
    >
      <Box className={styles.fields}>
        {!section && (
          <QuotationSelect
            label="חברה"
            value={brand}
            disabled={disabled}
            onChange={event => setBrand(event.target.value)}
            items={[
              { value: "", label: "כללי" },
              ...brands.map(value => ({ value, label: value })),
            ]}
          />
        )}
        {brand && !section && (
          <QuotationSelect
            value={system}
            label="סוג מערכת"
            disabled={disabled}
            items={QUOTATION_SYSTEM_OPTIONS}
            onChange={event => {
              const selected = QUOTATION_SYSTEM_OPTIONS.find(
                option => option.value === event.target.value,
              );
              if (selected) {
                setSystem(selected.value);
              }
            }}
          />
        )}
        {brand && (
          <QuotationSelect
            label="קומה"
            value={floorId}
            disabled={disabled}
            onChange={event => setFloorId(event.target.value)}
            items={[
              { value: "", label: "ללא קומה" },
              ...floors.map(floor => ({ value: floor.floorId, label: floor.floorName })),
              { value: "new", label: "קומה חדשה…" },
            ]}
          />
        )}
        {createFloor && (
          <QuotationInput
            maxLength={200}
            disabled={disabled}
            value={newFloorName}
            label="שם הקומה החדשה"
            onChange={event => setNewFloorName(event.target.value)}
          />
        )}
        <QuotationInput
          value={title}
          maxLength={200}
          label="כותרת מערכת"
          disabled={disabled}
          onChange={event => setTitle(event.target.value)}
        />
      </Box>
      <Box className={styles.actions}>
        <Button
          type={BUTTON_TYPES.SUBMIT}
          size={BUTTON_SIZES.COMPACT}
          disabled={!valid || disabled}
          text={section ? "עדכון מערכת" : "הוספה"}
        />
        <Button
          text="ביטול"
          onClick={onClose}
          size={BUTTON_SIZES.COMPACT}
          variant={BUTTON_VARIANTS.NEUTRAL}
        />
      </Box>
    </Box>
  );
};

export default QuotationSystemForm;
