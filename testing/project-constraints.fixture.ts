import { QueryClient } from "@tanstack/react-query";
import { project, engineer } from "./project-tasks.fixture";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { PERMISSIONS } from "../src/constants/permission.constant";
import { toProjectFormValues } from "../src/utilities/project.utility";
import { ALL_USERS_QUERY } from "../src/constants/project-form.constant";

export const makeValues = () => toProjectFormValues(project);
export const constraintUser = {
  ...engineer,
  permissions: [PERMISSIONS.PROJECTS_READ, PERMISSIONS.PROJECTS_UPDATE],
};
export const createConstraintClient = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: Infinity } },
  });
  client.setQueryData(QUERY_KEYS.users(ALL_USERS_QUERY), []);
  client.setQueryData(QUERY_KEYS.PROJECT_TYPES, []);
  client.setQueryData(QUERY_KEYS.PROJECT_STAGES, []);
  client.setQueryData(QUERY_KEYS.customer(project.customerId ?? ""), {
    id: project.customerId,
    name: "לקוח לבדיקה",
    customerType: "company",
    taxId: "512345678",
    prioritySyncStatus: "pending",
    contacts: [],
  });
  client.setQueryData(QUERY_KEYS.customers({ search: "", prioritySyncStatus: null }), []);
  return client;
};

export const createMemoryStorage = (): Storage => {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: key => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, value),
    removeItem: key => items.delete(key),
    key: index => [...items.keys()][index] ?? null,
  };
};

export interface IDeferred<TValue> {
  promise: Promise<TValue>;
  reject: (error: Error) => void;
  resolve: (value: TValue) => void;
}

export const deferred = <TValue>(): IDeferred<TValue> => {
  const state: {
    resolve: ((value: TValue) => void) | null;
    reject: ((error: Error) => void) | null;
  } = {
    resolve: null,
    reject: null,
  };
  const promise = new Promise<TValue>((resolve, reject) => {
    state.resolve = resolve;
    state.reject = reject;
  });
  return {
    promise,
    resolve: value => state.resolve?.(value),
    reject: error => state.reject?.(error),
  };
};
