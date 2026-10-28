import { useQuery } from "@tanstack/react-query";
import { customerContactService } from "../../services/customer-contact.service";
import { CUSTOMER_CONTACT_QUERY_ROOT } from "../../constants/customer-contact.constant";

export const useCustomerContactsQuery = (customerId: string) =>
  useQuery({
    queryKey: [CUSTOMER_CONTACT_QUERY_ROOT, customerId],
    queryFn: () => customerContactService.getAll(customerId),
  });
