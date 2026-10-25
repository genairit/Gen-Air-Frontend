import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import type { ISession } from "../interfaces/session.interface";
import { SESSION_USER_QUERY_KEY } from "../constants/permission.constant";
import { applySessionUserAction } from "../actions/session-permissions.action";

export const useSessionUserQuery = (session: ISession | null) => {
  const query = useQuery({
    retry: false,
    staleTime: 0,
    enabled: session !== null,
    queryFn: () => userService.getMe(),
    refetchOnWindowFocus: "always",
    queryKey: [...SESSION_USER_QUERY_KEY, session?.user.id ?? null],
  });

  useEffect(() => {
    if (session && query.data) {
      applySessionUserAction(session.accessToken, query.data);
    }
  }, [session, query.data]);

  return query;
};
