import { useQuery } from "@tanstack/react-query";
import type { ISession } from "../interfaces/session.interface";
import { SESSION_USER_QUERY_KEY } from "../constants/permission.constant";
import { verifySessionUserAction } from "../actions/session-refresh.action";

export const useSessionUserQuery = (session: ISession | null) => {
  const query = useQuery({
    retry: false,
    staleTime: 0,
    enabled: session !== null,
    queryFn: verifySessionUserAction,
    refetchOnWindowFocus: "always",
    queryKey: [...SESSION_USER_QUERY_KEY, session?.user.id ?? null],
  });

  return query;
};
