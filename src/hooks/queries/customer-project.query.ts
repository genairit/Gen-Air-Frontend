import type {
  ICustomerProjectPage,
  ICustomerProjectQuery,
} from "../../interfaces/customer-project.interface";

import { useInfiniteQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../constants/query-key.constant";
import { customerProjectService } from "../../services/customer-project.service";

const FIRST_CURSOR: string | null = null;
const getNextCursor = (page: ICustomerProjectPage) => page.nextCursor;

export const useCustomerProjectPagesQuery = (customerId: string, query: ICustomerProjectQuery) =>
  useInfiniteQuery({
    getNextPageParam: getNextCursor,
    initialPageParam: FIRST_CURSOR,
    queryKey: QUERY_KEYS.customerProjects(customerId, query),
    queryFn: ({ pageParam }) => customerProjectService.getPage(customerId, query, pageParam),
  });
