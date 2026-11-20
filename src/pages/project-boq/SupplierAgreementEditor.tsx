import {
  PROJECT_BOQ_COST_PATTERN,
  PROJECT_BOQ_QUANTITY_PATTERN,
} from "../../constants/project-boq.constant";

import type {
  ISupplier,
  IAgreementInput,
  IAgreementRevision,
  ISupplierAgreement,
} from "../../interfaces/supplier-agreement.interface";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import Button from "../../components/Button/Button";
import CheckBox from "../../components/CheckBox/CheckBox";
import TextField from "../../components/TextField/TextField";
import InlineError from "../../components/InlineError/InlineError";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { supplierAgreementStyles as styles } from "./supplier-agreement.style";
import type { IPurchaseLine } from "../../interfaces/purchase-record.interface";
import { formatAgreementPrice } from "../../utilities/supplier-agreement.utility";
import { supplierAgreementService } from "../../services/supplier-agreement.service";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../components/TextField/constants/textfield.constants";
import { SUPPLIER_CURRENCY_OPTIONS } from "../../constants/supplier-agreement.constant";
import { formatDate, normalizeDate, parseDateInput } from "../../utilities/date.utility";

interface IProps {
  projectId: string;
  line: IPurchaseLine;
  suppliers: ISupplier[];
  agreements: ISupplierAgreement[];
  onSave: (input: IAgreementInput, id?: string | null) => Promise<ISupplierAgreement>;
}

const SupplierAgreementEditor = ({ projectId, line, suppliers, agreements, onSave }: IProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<IAgreementInput>({ unitPrice: "", currencyCode: "ILS" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<IAgreementRevision[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const lineAgreements = agreements.filter(
    agreement =>
      agreement.boqSourceKey === line.sourceKey &&
      agreement.materialId === line.materialId &&
      agreement.materialUnit === line.materialUnit,
  );
  const availableSuppliers = suppliers.filter(
    supplier =>
      supplier.active && !lineAgreements.some(agreement => agreement.supplierId === supplier.id),
  );
  const supplierOptions = availableSuppliers.map(supplier => ({
    value: supplier.id,
    label: supplier.name,
    ...(supplier.contactName ? { subtitle: supplier.contactName } : {}),
  }));
  const validPrice = PROJECT_BOQ_COST_PATTERN.test(form.unitPrice);
  const validQuantity =
    !form.agreedQuantity || PROJECT_BOQ_QUANTITY_PATTERN.test(form.agreedQuantity);
  const validFrom = !form.effectiveFrom || parseDateInput(form.effectiveFrom) !== null;
  const validThrough = !form.effectiveThrough || parseDateInput(form.effectiveThrough) !== null;
  const validDateRange =
    !form.effectiveFrom || !form.effectiveThrough || form.effectiveFrom <= form.effectiveThrough;
  const valid = validPrice && validQuantity && validFrom && validThrough && validDateRange;
  const add = () => {
    setEditingId(null);
    setForm({
      boqLineId: line.id,
      supplierId: "",
      unitPrice: "",
      currencyCode: "ILS",
      agreedQuantity: "",
      effectiveFrom: "",
      effectiveThrough: "",
      notes: "",
      active: true,
    });
    setError("");
    setHistory(null);
    setFormOpen(true);
  };
  const edit = (agreement: ISupplierAgreement) => {
    setEditingId(agreement.id);
    setForm({
      unitPrice: agreement.unitPrice,
      currencyCode: agreement.currencyCode,
      agreedQuantity: agreement.agreedQuantity,
      effectiveFrom: agreement.effectiveFrom,
      effectiveThrough: agreement.effectiveThrough,
      notes: agreement.notes,
      active: agreement.active,
      expectedVersion: agreement.version,
    });
    setError("");
    setHistory(null);
    setFormOpen(true);
  };
  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave(form, editingId);
      setFormOpen(false);
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  };
  const loadHistory = async () => {
    if (!editingId) {
      return;
    }
    setHistoryLoading(true);
    setError("");
    try {
      setHistory(await supplierAgreementService.history(projectId, editingId));
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setHistoryLoading(false);
    }
  };
  return (
    <Box component="details" sx={styles.disclosure}>
      <Box component="summary">הסכמי ספקים · {lineAgreements.length}</Box>
      <Box sx={styles.section}>
        {lineAgreements.length === 0 && <Typography>אין הסכם לחומר זה.</Typography>}
        {lineAgreements.map(agreement => (
          <Box sx={styles.row} key={agreement.id}>
            <Typography sx={{ fontWeight: 700 }}>{agreement.supplierName}</Typography>
            <Typography>
              {formatAgreementPrice(agreement)} / {agreement.materialUnit}
            </Typography>
            {agreement.agreedQuantity && (
              <Typography variant="body2">
                כמות מוסכמת לעיון: {Number(agreement.agreedQuantity).toLocaleString("he-IL")}
              </Typography>
            )}
            {(agreement.effectiveFrom || agreement.effectiveThrough) && (
              <Typography variant="body2">
                תוקף: {agreement.effectiveFrom || "ללא התחלה"} עד{" "}
                {agreement.effectiveThrough || "ללא סיום"}
              </Typography>
            )}
            {agreement.notes && <Typography variant="body2">{agreement.notes}</Typography>}
            {!agreement.active && <Typography variant="body2">לא פעיל</Typography>}
            <Button
              onClick={() => edit(agreement)}
              variant={BUTTON_VARIANTS.NEUTRAL}
              text={`ערוך הסכם ${agreement.supplierName}`}
            />
          </Box>
        ))}
        <Button
          onClick={add}
          text="הוסף הסכם לחומר"
          variant={BUTTON_VARIANTS.SECONDARY}
          disabled={availableSuppliers.length === 0}
        />
        {availableSuppliers.length === 0 && (
          <Typography variant="body2">
            יש להוסיף ספק פעיל שאינו משויך לחומר זה כדי ליצור הסכם נוסף.
          </Typography>
        )}
        {formOpen && (
          <Box sx={styles.section}>
            <Typography component="h4" sx={styles.heading}>
              {editingId ? "עריכת הסכם" : "הסכם חדש"}
            </Typography>
            {editingId ? (
              <Typography>
                ספק: {lineAgreements.find(agreement => agreement.id === editingId)?.supplierName}
              </Typography>
            ) : (
              <Autocomplete
                isRequired
                title="ספק"
                items={supplierOptions}
                value={form.supplierId ?? null}
                onChange={value => setForm(current => ({ ...current, supplierId: value ?? "" }))}
              />
            )}
            <Box sx={styles.form}>
              <TextField
                isRequired
                value={form.unitPrice}
                type={FIELD_TYPES.NUMBER}
                title={`מחיר מוסכם ל${line.materialUnit}`}
                onChange={value => setForm(current => ({ ...current, unitPrice: value }))}
              />
              <Autocomplete
                isRequired
                title="מטבע"
                isAutocomplete={false}
                value={form.currencyCode}
                options={SUPPLIER_CURRENCY_OPTIONS}
                onChange={value =>
                  setForm(current => ({ ...current, currencyCode: value ?? "ILS" }))
                }
              />
              <TextField
                type={FIELD_TYPES.NUMBER}
                value={form.agreedQuantity ?? ""}
                title={`כמות מוסכמת לעיון (${line.materialUnit})`}
                onChange={value => setForm(current => ({ ...current, agreedQuantity: value }))}
              />
              <TextField
                title="בתוקף מתאריך"
                type={FIELD_TYPES.DATE}
                value={form.effectiveFrom ?? ""}
                onChange={value => setForm(current => ({ ...current, effectiveFrom: value }))}
              />
              <TextField
                title="בתוקף עד"
                type={FIELD_TYPES.DATE}
                value={form.effectiveThrough ?? ""}
                onChange={value => setForm(current => ({ ...current, effectiveThrough: value }))}
              />
              <TextField
                title="הערות להסכם"
                type={FIELD_TYPES.TEXT}
                value={form.notes ?? ""}
                onChange={value => setForm(current => ({ ...current, notes: value }))}
              />
            </Box>
            <CheckBox
              text="הסכם פעיל"
              value={form.active ?? true}
              onChange={value => setForm(current => ({ ...current, active: value }))}
            />
            <Typography variant="body2">
              שינוי מחיר או פרטי הסכם לא משנה הזמנות שכבר נרשמו.
            </Typography>
            {error && <InlineError message={error} />}
            <Box sx={styles.actions}>
              <Button
                onClick={save}
                text="שמור הסכם"
                isLoading={saving}
                disabled={saving || !valid || (!editingId && !form.supplierId)}
              />
              {editingId && (
                <Button
                  onClick={loadHistory}
                  text="היסטוריית מחירים"
                  disabled={historyLoading}
                  variant={BUTTON_VARIANTS.NEUTRAL}
                />
              )}
              <Button
                text="ביטול"
                variant={BUTTON_VARIANTS.NEUTRAL}
                onClick={() => setFormOpen(false)}
              />
            </Box>
            {historyLoading && <Typography role="status">טוען היסטוריה…</Typography>}
            {history?.map(revision => (
              <Typography variant="body2" key={revision.version}>
                גרסה {revision.version} ·{" "}
                {Number(revision.snapshot.unitPrice).toLocaleString("he-IL")}{" "}
                {revision.snapshot.currencyCode} · {formatDate(normalizeDate(revision.createdAt))}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SupplierAgreementEditor;
