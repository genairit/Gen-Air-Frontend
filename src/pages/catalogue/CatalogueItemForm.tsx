import {
  SYSTEM_OPTIONS,
  toCatalogueChanges,
  createCatalogueForm,
  catalogueFormFields,
  validateCatalogueForm,
  EQUIPMENT_ROLE_OPTIONS,
  changedCatalogueFields,
} from "./catalogue-form.utility";

import { Box } from "@mui/material";
import { isAxiosError } from "axios";
import { usePageStyles } from "../page.style";
import { useState, type FormEvent } from "react";
import Button from "../../components/Button/Button";
import { useCatalogueStyles } from "./catalogue.style";
import { logger } from "../../utilities/logger.utility";
import CheckBox from "../../components/CheckBox/CheckBox";
import { HTTP_STATUS } from "../../constants/api.constant";
import { ICON_NAMES } from "../../constants/icon.constant";
import TextField from "../../components/TextField/TextField";
import CatalogueArchiveDialog from "./CatalogueArchiveDialog";
import { useCatalogueMutation } from "../../hooks/catalogue.hook";
import { catalogueStatusLabel } from "./catalogue-display.utility";
import InlineError from "../../components/InlineError/InlineError";
import SelectField from "../../components/SelectField/SelectField";
import { catalogueService } from "../../services/catalogue.service";
import GenericPopup from "../../components/GenericPopup/GenericPopup";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { toErrorValidator } from "../../utilities/field-feedback.utility";
import type { ICatalogueItem } from "../../interfaces/quotation.interface";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../components/TextField/constants/textfield.constants";
import { CATALOGUE_STATUS, QUOTATION_BRANDS } from "../../constants/quotation.constant";
import type { TCatalogueErrors, TCatalogueForm } from "../../interfaces/catalogue.interface";

interface ICatalogueItemFormProps {
  onCancel: () => void;
  item?: ICatalogueItem;
  onSaved: (message: string) => void;
}

const CatalogueItemForm = ({ item, onCancel, onSaved }: ICatalogueItemFormProps) => {
  const page = usePageStyles();
  const styles = useCatalogueStyles();
  const [original] = useState(() => createCatalogueForm(item));
  const [form, setForm] = useState(original);
  const [errors, setErrors] = useState<TCatalogueErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const save = useCatalogueMutation((values: TCatalogueForm) =>
    item
      ? catalogueService.update(item.id, changedCatalogueFields(values, original))
      : catalogueService.create({
          ...toCatalogueChanges(values),
          sku: values.sku.trim(),
          brand: values.brand,
          systemType: values.systemType,
        }),
  );
  const locked = save.isPending;
  const availableBrands = [...new Set([...QUOTATION_BRANDS, original.brand].filter(Boolean))];
  const change = (values: Partial<TCatalogueForm>) => {
    setForm(previous => ({ ...previous, ...values }));
    setError(null);
  };

  const submit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (locked) return;
    const nextErrors = validateCatalogueForm(form, item ? original : null);
    setErrors(nextErrors);
    setError(null);
    if (Object.keys(nextErrors).length > 0) return;
    if (item && Object.keys(changedCatalogueFields(form, original)).length === 0) {
      onCancel();
      return;
    }
    try {
      await save.mutateAsync(form);
      onSaved(item ? "השינויים נשמרו" : "פריט הקטלוג נוצר");
    } catch (failure) {
      if (!item && isAxiosError(failure) && failure.response?.status === HTTP_STATUS.CONFLICT) {
        setErrors({ sku: "מק״ט זה כבר פעיל בקטלוג" });
      } else {
        const status = isAxiosError(failure) ? (failure.response?.status ?? null) : null;
        logger.error("Catalogue item save failed", { status, action: item ? "edit" : "create" });
        setError(getApiErrorMessage(failure));
      }
    }
  };

  const fields = (
    <Box noValidate component="form" onSubmit={submit} sx={page.stack({ gap: "18px" })}>
      {item && (
        <Box component="span" sx={page.caption}>
          {catalogueStatusLabel(item.status) ?? ""}
        </Box>
      )}
      <Box sx={styles.fieldGrid}>
        {catalogueFormFields(Boolean(item)).map(field => (
          <Box key={field.name} sx={{ gridColumn: field.gridColumn }}>
            <TextField
              disabled={locked}
              title={field.label}
              isLtr={field.isLtr}
              type={FIELD_TYPES.TEXT}
              value={form[field.name]}
              isRequired={field.required}
              maxLength={field.maxLength}
              multiline={field.multiline}
              readonly={field.inputAttributes.readOnly}
              validator={toErrorValidator(errors[field.name])}
              slotProps={{ htmlInput: field.inputAttributes }}
              onChange={value => {
                change({ [field.name]: value });
                setErrors(previous => ({ ...previous, [field.name]: null }));
              }}
              {...field.extra}
            />
          </Box>
        ))}
      </Box>
      <Box component="details" sx={styles.optional}>
        <Box component="summary">מאפייני ציוד</Box>
        <Box sx={styles.fieldGrid}>
          <SelectField
            title="חברת מיזוג"
            value={form.brand}
            ariaLabel="חברת מיזוג"
            disabled={locked || Boolean(item)}
            onChange={event => change({ brand: event.target.value })}
            items={[
              { value: "", label: "כללי" },
              ...availableBrands.map(value => ({ value, label: value })),
            ]}
          />
          <SelectField
            title="סוג מערכת"
            ariaLabel="סוג מערכת"
            items={SYSTEM_OPTIONS}
            value={form.systemType ?? ""}
            disabled={locked || Boolean(item)}
            onChange={event => change({ systemType: event.target.value || null })}
          />
          <SelectField
            disabled={locked}
            title="תפקיד הציוד"
            ariaLabel="תפקיד הציוד"
            value={form.equipmentRole}
            items={EQUIPMENT_ROLE_OPTIONS}
            onChange={event => change({ equipmentRole: event.target.value })}
          />
          <Box sx={page.row({ gap: "16px" })}>
            <CheckBox
              text="כולל שלט"
              disabled={locked}
              value={form.includesRemote}
              onChange={value => change({ includesRemote: value })}
            />
            <CheckBox
              disabled={locked}
              text="כולל תרמוסטט"
              value={form.includesThermostat}
              onChange={value => change({ includesThermostat: value })}
            />
          </Box>
        </Box>
      </Box>
      {error && <InlineError message={error} />}
      {item && item.status !== CATALOGUE_STATUS.ARCHIVED && (
        <Box>
          <Button
            disabled={locked}
            text="הסרה מהקטלוג"
            icon={ICON_NAMES.DELETE}
            variant={BUTTON_VARIANTS.DANGER}
            onClick={() => setConfirming(true)}
          />
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <GenericPopup
        open
        dir="rtl"
        align="right"
        maxWidth="md"
        content={fields}
        onClose={onCancel}
        closeDisabled={locked}
        closeAfterAction={false}
        title={item ? "עריכת פריט קטלוג" : "פריט קטלוג חדש"}
        buttons={{
          primary: {
            isDisabled: locked,
            onClick: () => submit(),
            text: item ? "שמירת שינויים" : "יצירת פריט",
          },
          secondary: { text: "ביטול", isDisabled: locked, onClick: onCancel },
        }}
      />
      {item && confirming && (
        <CatalogueArchiveDialog
          item={item}
          onArchived={onSaved}
          onClose={() => setConfirming(false)}
        />
      )}
    </>
  );
};

export default CatalogueItemForm;
