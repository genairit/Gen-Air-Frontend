import { useQuery } from "@tanstack/react-query";
import { userService } from "../../services/user.service";
import { QUERY_KEYS } from "../../constants/query-key.constant";
import type { IUserQuery } from "../../interfaces/api-request.interface";

export const useUsersQuery = (query: IUserQuery) =>
  useQuery({ queryKey: QUERY_KEYS.users(query), queryFn: () => userService.getByFilter(query) });

export const useUserRoleCountsQuery = () =>
  useQuery({ queryKey: QUERY_KEYS.USER_ROLE_COUNTS, queryFn: () => userService.getRoleCounts() });
