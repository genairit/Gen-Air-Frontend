import { useMutation } from "@tanstack/react-query";
import { createCustomerAction } from "../../actions/customer.action";

export const useCreateCustomerMutation = () => useMutation({ mutationFn: createCustomerAction });
