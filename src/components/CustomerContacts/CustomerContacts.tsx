import type {
  ICustomerContact,
  ICustomerContactEditor,
} from "../../interfaces/customer-contact.interface";

import Card from "../Card/Card";
import { Box } from "@mui/material";
import Button from "../Button/Button";
import { type FC, useState } from "react";
import CardHeader from "../CardHeader/CardHeader";
import InlineError from "../InlineError/InlineError";
import { usePageStyles } from "../../pages/page.style";
import CustomerContactItem from "./CustomerContactItem";
import { useSessionUser } from "../../store/session.store";
import { ICON_NAMES } from "../../constants/icon.constant";
import CustomerContactEditor from "./CustomerContactEditor";
import { hasPermission } from "../../utilities/permission.utility";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { CUSTOMER_CONTACT_COPY } from "../../constants/customer-contact.constant";
import { toCustomerContactDraft } from "../../utilities/customer-contact.utility";
import { useCustomerContactsQuery } from "../../hooks/queries/customer-contact.query";
import { useSaveCustomerContactMutation } from "../../hooks/mutations/customer-contact.mutation";

interface ICustomerContactsProps {
  customerId: string;
  editable?: boolean;
}
const CustomerContacts: FC<ICustomerContactsProps> = ({ customerId, editable = false }) => {
  const styles = usePageStyles();
  const user = useSessionUser();
  const [editor, setEditor] = useState<ICustomerContactEditor | null>(null);
  const contactsQuery = useCustomerContactsQuery(customerId);
  const saveMutation = useSaveCustomerContactMutation();
  const canManage = editable && hasPermission(user, "MANAGE_CUSTOMERS");
  const canStart = canManage && editor === null;
  const contacts = contactsQuery.data ?? [];
  const isEmpty = contactsQuery.isSuccess && contacts.length === 0;
  const queryError = contactsQuery.isError ? getApiErrorMessage(contactsQuery.error) : null;
  const saveError = saveMutation.isError ? getApiErrorMessage(saveMutation.error) : null;
  const startEditing = (contact: ICustomerContact | null) => {
    saveMutation.reset();
    setEditor({ id: contact?.id ?? null, values: toCustomerContactDraft(contact) });
  };
  const save = () => {
    if (!editor || !canManage) {
      return;
    }

    saveMutation.mutate({ customerId, editor }, { onSuccess: () => setEditor(null) });
  };
  const contactItems = contacts.map(contact => ({
    contact,
    onEdit: canStart ? () => startEditing(contact) : null,
  }));
  const showEditor = editor !== null && canManage;
  const addAction = canStart ? (
    <Button text={CUSTOMER_CONTACT_COPY.ADD} onClick={() => startEditing(null)} />
  ) : null;
  return (
    <Card gap="18px" padding="24px">
      <CardHeader
        action={addAction}
        icon={ICON_NAMES.CONTACTS}
        title={CUSTOMER_CONTACT_COPY.TITLE}
        subtitle={CUSTOMER_CONTACT_COPY.SUBTITLE}
      />
      {contactsQuery.isPending && <span role="status">{CUSTOMER_CONTACT_COPY.LOADING}</span>}
      {queryError && <InlineError message={queryError} />}
      {isEmpty && <span>{CUSTOMER_CONTACT_COPY.EMPTY}</span>}
      <Box sx={styles.stack({})}>
        {contactItems.map(({ contact, onEdit }) => (
          <CustomerContactItem onEdit={onEdit} key={contact.id} contact={contact} />
        ))}
      </Box>
      {showEditor && editor && (
        <CustomerContactEditor
          onSave={save}
          error={saveError}
          values={editor.values}
          busy={saveMutation.isPending}
          onCancel={() => setEditor(null)}
          onChange={values => setEditor({ ...editor, values })}
        />
      )}
    </Card>
  );
};
export default CustomerContacts;
