import { useMutation } from "@tanstack/react-query";
import { saveCustomerContactAction } from "../../actions/customer-contact.action";

export const useSaveCustomerContactMutation = () =>
  useMutation({ mutationFn: saveCustomerContactAction });
