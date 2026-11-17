import { useState } from "react";
import { Box, Typography } from "@mui/material";
import Button from "../../components/Button/Button";
import CheckBox from "../../components/CheckBox/CheckBox";
import TextField from "../../components/TextField/TextField";
import InlineError from "../../components/InlineError/InlineError";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { supplierAgreementStyles as styles } from "./supplier-agreement.style";
import { EMPTY_SUPPLIER_INPUT } from "../../constants/supplier-agreement.constant";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../components/TextField/constants/textfield.constants";
import type { ISupplier, ISupplierInput } from "../../interfaces/supplier-agreement.interface";

interface IProps {
  isLoading: boolean;
  suppliers: ISupplier[];
  onSave: (input: ISupplierInput, id?: string | null) => Promise<ISupplier>;
}

const SupplierDirectory = ({ suppliers, isLoading, onSave }: IProps) => {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ISupplierInput>(EMPTY_SUPPLIER_INPUT);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const visibleSuppliers = suppliers.filter(supplier =>
    [supplier.name, supplier.contactName, supplier.phone, supplier.email].some(value =>
      value?.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    ),
  );
  const edit = (supplier: ISupplier) => {
    setEditingId(supplier.id);
    setForm({
      name: supplier.name,
      contactName: supplier.contactName,
      phone: supplier.phone,
      email: supplier.email,
      notes: supplier.notes,
      active: supplier.active,
      expectedVersion: supplier.version,
    });
    setError("");
    setFormOpen(true);
  };
  const add = () => {
    setEditingId(null);
    setForm(EMPTY_SUPPLIER_INPUT);
    setError("");
    setFormOpen(true);
  };
  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const supplier = await onSave(form, editingId);
      setSaved(`הספק ${supplier.name} נשמר`);
      setFormOpen(false);
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Box component="details" sx={styles.disclosure}>
      <Box component="summary">ספקים · חיפוש וניהול</Box>
      <Box sx={styles.section}>
        <Box sx={styles.row}>
          <TextField
            value={search}
            title="חיפוש ספק"
            onChange={setSearch}
            type={FIELD_TYPES.SEARCH}
          />
          <Button onClick={add} text="הוסף ספק" variant={BUTTON_VARIANTS.SECONDARY} />
        </Box>
        {saved && <Typography role="status">{saved}</Typography>}
        {isLoading && <Typography role="status">טוען ספקים…</Typography>}
        {!isLoading && visibleSuppliers.length === 0 && (
          <Typography>לא נמצאו ספקים. אפשר להוסיף ספק חדש.</Typography>
        )}
        {visibleSuppliers.map(supplier => (
          <Box sx={styles.row} key={supplier.id}>
            <Typography sx={{ fontWeight: 700 }}>{supplier.name}</Typography>
            <Typography variant="body2">{supplier.contactName || "ללא איש קשר"}</Typography>
            {supplier.phone && (
              <Typography dir="ltr" variant="body2">
                {supplier.phone}
              </Typography>
            )}
            {supplier.email && (
              <Typography dir="ltr" variant="body2">
                {supplier.email}
              </Typography>
            )}
            {!supplier.active && <Typography variant="body2">לא פעיל</Typography>}
            <Button
              text={`ערוך ${supplier.name}`}
              onClick={() => edit(supplier)}
              variant={BUTTON_VARIANTS.NEUTRAL}
            />
          </Box>
        ))}
        {formOpen && (
          <Box sx={styles.section}>
            <Typography component="h3" sx={styles.heading}>
              {editingId ? "עריכת ספק" : "ספק חדש"}
            </Typography>
            <Box sx={styles.form}>
              <TextField
                isRequired
                title="שם ספק"
                value={form.name}
                type={FIELD_TYPES.TEXT}
                onChange={value => setForm(current => ({ ...current, name: value }))}
              />
              <TextField
                title="איש קשר להזמנות"
                type={FIELD_TYPES.TEXT}
                value={form.contactName ?? ""}
                onChange={value => setForm(current => ({ ...current, contactName: value }))}
              />
              <TextField
                title="טלפון"
                type={FIELD_TYPES.PHONE}
                value={form.phone ?? ""}
                onChange={value => setForm(current => ({ ...current, phone: value }))}
              />
              <TextField
                title="דוא״ל"
                type={FIELD_TYPES.EMAIL}
                value={form.email ?? ""}
                onChange={value => setForm(current => ({ ...current, email: value }))}
              />
              <TextField
                title="הערות ספק"
                type={FIELD_TYPES.TEXT}
                value={form.notes ?? ""}
                onChange={value => setForm(current => ({ ...current, notes: value }))}
              />
            </Box>
            <CheckBox
              text="ספק פעיל"
              value={form.active ?? true}
              onChange={value => setForm(current => ({ ...current, active: value }))}
            />
            {error && <InlineError message={error} />}
            <Box sx={styles.actions}>
              <Button
                onClick={save}
                text="שמור ספק"
                isLoading={saving}
                disabled={saving || !form.name.trim()}
              />
              <Button
                text="ביטול"
                variant={BUTTON_VARIANTS.NEUTRAL}
                onClick={() => setFormOpen(false)}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SupplierDirectory;
