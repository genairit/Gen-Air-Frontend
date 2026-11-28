import { useState } from "react";
import CustomersTable from "./components/CustomersTable";
import { useSessionUser } from "../../store/session.store";
import { PERMISSIONS } from "../../constants/permission.constant";
import CustomerFormPopup from "../customer-form/CustomerFormPopup";
import type { IApiCustomer } from "../../interfaces/api.interface";
import { hasPermission } from "../../utilities/permission.utility";

const CustomersPage = () => {
  const user = useSessionUser();
  const [editing, setEditing] = useState<IApiCustomer | null>(null);
  const canEdit = hasPermission(user, PERMISSIONS.CUSTOMERS_UPDATE);

  const openEditor = canEdit ? setEditing : null;

  const editableCustomer = canEdit ? editing : null;

  return (
    <>
      <CustomersTable onEdit={openEditor} />
      {editableCustomer && (
        <CustomerFormPopup customer={editableCustomer} onClose={() => setEditing(null)} />
      )}
    </>
  );
};

export default CustomersPage;
