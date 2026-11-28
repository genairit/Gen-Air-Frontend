import { useState, type FC } from "react";
import CustomerForm from "./components/CustomerForm";
import type { IApiCustomer } from "../../interfaces/api.interface";
import CustomerProjectLinkStep from "./components/CustomerProjectLinkStep";

interface ICustomerFormPopupProps {
  onClose: () => void;
  customer?: IApiCustomer;
}

const CustomerFormPopup: FC<ICustomerFormPopupProps> = ({ customer, onClose }) => {
  const [createdId, setCreatedId] = useState<string | null>(null);
  const finishSave = customer ? onClose : setCreatedId;

  if (createdId) {
    return <CustomerProjectLinkStep popup onFinish={onClose} customerId={createdId} />;
  }

  return <CustomerForm popup onCancel={onClose} customer={customer} onSaved={finishSave} />;
};

export default CustomerFormPopup;
