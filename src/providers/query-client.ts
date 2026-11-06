import { QueryClient, MutationCache } from "@tanstack/react-query";
import { AuthorizationContext } from "../managers/authorization-context.manager";

const mutationContexts = new WeakMap<object, AuthorizationContext>();

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onMutate: (_variables, mutation) => {
      if (mutation.meta?.authorizationIndependent === true) {
        return;
      }

      mutationContexts.set(mutation, new AuthorizationContext());
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      mutationContexts.get(mutation)?.assertCurrent();
    },
    onSettled: (_data, error, _variables, _context, mutation) => {
      if (error !== null) {
        return;
      }

      mutationContexts.get(mutation)?.assertCurrent();
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});
