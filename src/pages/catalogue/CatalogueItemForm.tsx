import {
  SYSTEM_OPTIONS,
  toCatalogueChanges,
  createCatalogueForm,
  CATALOGUE_FORM_FIELDS,
  validateCatalogueForm,
  EQUIPMENT_ROLE_OPTIONS,
  changedCatalogueFields,
} from "./catalogue-form.utility";

import { Box } from "@mui/material";
import { isAxiosError } from "axios";
import { usePageStyles } from "../page.style";
import Card from "../../components/Card/Card";
import { useState, type FormEvent } from "react";
import Button from "../../components/Button/Button";
import { useCatalogueStyles } from "./catalogue.style";
import CheckBox from "../../components/CheckBox/CheckBox";
import { ICON_NAMES } from "../../constants/icon.constant";
import { HTTP_STATUS } from "../../constants/api.constant";
import TextField from "../../components/TextField/TextField";
import CardHeader from "../../components/CardHeader/CardHeader";
import { useCatalogueMutation } from "../../hooks/catalogue.hook";
import { catalogueStatusLabel } from "./catalogue-display.utility";
import InlineError from "../../components/InlineError/InlineError";
import SelectField from "../../components/SelectField/SelectField";
import { BUTTON_TYPES } from "../../constants/button-type.constant";
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
  const archive = useCatalogueMutation((id: string) =>
    catalogueService.update(id, { status: CATALOGUE_STATUS.ARCHIVED }),
  );
  const locked = save.isPending || archive.isPending;
  const availableBrands = [...new Set([...QUOTATION_BRANDS, original.brand].filter(Boolean))];
  const change = (values: Partial<TCatalogueForm>) => {
    setForm(previous => ({ ...previous, ...values }));
    setError(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (locked) return;
    const nextErrors = validateCatalogueForm(form, item ? original : undefined);
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
        setError(getApiErrorMessage(failure));
      }
    }
  };

  return (
    <Box noValidate component="form" onSubmit={submit} sx={page.stack({ gap: "18px" })}>
      <Card gap="18px" ariaLabel="פרטי פריט">
        <CardHeader
          title="פרטי פריט"
          icon={ICON_NAMES.HVAC}
          subtitle={item ? (catalogueStatusLabel(item.status) ?? undefined) : undefined}
        />
        <Box sx={styles.fieldGrid}>
          {CATALOGUE_FORM_FIELDS.map(({ name, label, maxLength, required }) => (
            <Box key={name} sx={{ gridColumn: name === "description" ? "1 / -1" : "auto" }}>
              <TextField
                title={label}
                disabled={locked}
                value={form[name]}
                isRequired={required}
                maxLength={maxLength}
                type={FIELD_TYPES.TEXT}
                multiline={name === "description"}
                readonly={name === "sku" && Boolean(item)}
                validator={toErrorValidator(errors[name])}
                minRows={name === "description" ? 2 : undefined}
                isLtr={name === "sku" || name === "price" || name === "capacityBtu"}
                onChange={value => {
                  change({ [name]: value });
                  setErrors(previous => ({ ...previous, [name]: undefined }));
                }}
                slotProps={{
                  htmlInput: {
                    inputMode:
                      name === "price" ? "decimal" : name === "capacityBtu" ? "numeric" : undefined,
                    "aria-required": required,
                  },
                }}
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
        <Box sx={page.spacedRow}>
          {item && item.status !== CATALOGUE_STATUS.ARCHIVED && (
            <Button
              disabled={locked}
              text="הסרה מהקטלוג"
              variant={BUTTON_VARIANTS.DANGER}
              onClick={() => setConfirming(true)}
            />
          )}
          <Box sx={{ ...page.endRow, marginInlineStart: "auto" }}>
            <Button
              text="ביטול"
              disabled={locked}
              onClick={onCancel}
              variant={BUTTON_VARIANTS.NEUTRAL}
            />
            <Button
              disabled={locked}
              type={BUTTON_TYPES.SUBMIT}
              isLoading={save.isPending}
              text={item ? "שמירת שינויים" : "יצירת פריט"}
            />
          </Box>
        </Box>
      </Card>
      {item && confirming && (
        <GenericPopup
          open
          dir="rtl"
          align="right"
          closeAfterAction={false}
          title="הסרת פריט מהקטלוג"
          closeDisabled={archive.isPending}
          onClose={() => {
            if (!archive.isPending) setConfirming(false);
          }}
          buttons={{
            primary: {
              text: "הסרת הפריט",
              isDisabled: archive.isPending,
              onClick: async () => {
                await archive.mutateAsync(item.id);
                onSaved("הפריט הוסר מהקטלוג");
              },
            },
            secondary: {
              text: "ביטול",
              isDisabled: archive.isPending,
              onClick: () => {
                archive.reset();
                setConfirming(false);
              },
            },
          }}
          content={
            <Box sx={page.stack({ gap: "10px" })}>
              <Box component="strong">
                {item.description || item.sku}{" "}
                <Box component="bdi">{item.description && item.sku}</Box>
              </Box>
              <Box component="span">
                הפריט לא יוצע לבחירה חדשה. מסמכים שמורים ימשיכו לכלול אותו. טיוטת כתב כמויות עשויה
                לדרוש פריט חלופי כדי לקבל אישור.
              </Box>
            </Box>
          }
        />
      )}
    </Box>
  );
};

export default CatalogueItemForm;
