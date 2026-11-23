import type { ICustomerContact } from "./customer-contact.interface";

export interface IContactDirectorySearchOptions {
  search: string;
  enabled?: boolean;
}

export interface IContactDirectorySearchResult {
  isReady: boolean;
  hasQuery: boolean;
  isLoading: boolean;
  showPrompt: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
  contacts: ICustomerContact[];
}
