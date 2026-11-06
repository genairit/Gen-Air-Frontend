import {
  type Ref,
  type UIEvent,
  type RefObject,
  type ReactNode,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

export interface IAutocompleteOption {
  value: string;
  label: string;
  subtitle?: string;
  helperText?: string;
  helperTextColor?: string;
}

export type TFieldCursor = "default" | "pointer" | "text";

export interface IAutocompleteActions {
  open: () => void;
}

export interface IAutocompleteColors {
  text: string;
  hint: string;
  label: string;
  accent: string;
  required: string;
  placeholder: string;
}

export interface IAutocompleteProps {
  hint?: string;
  label?: string;
  pageSize?: number;
  required?: boolean;
  disabled?: boolean;
  emptyText?: string;
  hasShadow?: boolean;
  isLoading?: boolean;
  cancelText?: string;
  clearLabel?: string;
  loadingText?: string;
  placeholder?: string;
  value: string | null;
  startIcon?: ReactNode;
  isClearable?: boolean;
  isSearchMode?: boolean;
  maxVisibleRows?: number;
  onLoadMore?: () => void;
  isInputReadOnly?: boolean;
  isSearchIconShown?: boolean;
  isMatchHighlighted?: boolean;
  options: IAutocompleteOption[];
  onSearch?: (value: string) => void;
  colors?: Partial<IAutocompleteColors>;
  onChange: (value: string | null) => void;
  searchModeContainer?: HTMLElement | null;
  actionsRef?: Ref<IAutocompleteActions | null>;
}

export interface IComboboxAriaOptions {
  listId: string;
  hintId: string;
  isOpen: boolean;
  hasHint: boolean;
  required: boolean;
  activeOptionId: string | null;
}

export interface IComboboxAriaAttributes {
  role: "combobox";
  "aria-controls": string;
  "aria-required": boolean;
  "aria-expanded": boolean;
  "aria-autocomplete": "list";
  "aria-describedby"?: string;
  "aria-activedescendant"?: string;
}

export interface IActiveIndexMove {
  step: number;
  current: number;
  optionsCount: number;
}

export interface IAutocompleteStyleParams {
  hasShadow: boolean;
  colors: IAutocompleteColors;
}

export interface IUseAutocompleteSearchOptions {
  pageSize: number;
  isLoading: boolean;
  value: string | null;
  onLoadMore?: () => void;
  autoFocusSearch?: boolean;
  options: IAutocompleteOption[];
  onSearch?: (value: string) => void;
  onChange: (value: string | null) => void;
}

export interface IUseAutocompleteSearchResult {
  query: string;
  isOpen: boolean;
  isEmpty: boolean;
  activeIndex: number;
  clearQuery: () => void;
  clearValue: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  visibleOptions: IAutocompleteOption[];
  setActiveIndex: (index: number) => void;
  activeOption: IAutocompleteOption | null;
  listRef: RefObject<HTMLDivElement | null>;
  selectedOption: IAutocompleteOption | null;
  inputRef: RefObject<HTMLInputElement | null>;
  searchInputRef: RefObject<HTMLInputElement | null>;
  selectOption: (option: IAutocompleteOption) => void;
  handleListScroll: (event: UIEvent<HTMLDivElement>) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  typeQuery: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export interface IMatchedTextProps {
  text: string;
  query: string;
  isHighlighted: boolean;
}

export interface ISearchFieldProps {
  hasShadow: boolean;
  clearLabel: string;
  onOpen?: () => void;
  onClear: () => void;
  children: ReactNode;
  startIcon?: ReactNode;
  isClearShown: boolean;
  cursor?: TFieldCursor;
  isSearchIconShown: boolean;
  colors: IAutocompleteColors;
}

export interface IOptionListProps {
  query: string;
  listId: string;
  isEmpty: boolean;
  emptyText: string;
  isLoading: boolean;
  activeIndex: number;
  loadingText: string;
  value: string | null;
  maxVisibleRows: number;
  isMatchHighlighted: boolean;
  colors: IAutocompleteColors;
  options: IAutocompleteOption[];
  onActivate: (index: number) => void;
  listRef: RefObject<HTMLDivElement | null>;
  onSelect: (option: IAutocompleteOption) => void;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
}

export interface ISearchModeOverlayProps {
  label?: string;
  field: ReactNode;
  labelFor: string;
  isExiting: boolean;
  hasShadow: boolean;
  cancelText: string;
  children: ReactNode;
  onClose: () => void;
  keyboardInset: number;
  colors: IAutocompleteColors;
  container: HTMLElement | null;
}
