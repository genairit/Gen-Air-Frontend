import {
  type TFieldCursor,
  type IActiveIndexMove,
  type IAutocompleteOption,
  type IComboboxAriaOptions,
  type IComboboxAriaAttributes,
} from "../../../interfaces/autocomplete.interface";

import { clamp } from "../../../utilities/number.utility";
import { AUTOCOMPLETE_LAYOUT, AUTOCOMPLETE_SEARCH } from "../../../constants/autocomplete.constant";

export const filterOptionsByQuery = (
  options: IAutocompleteOption[],
  query: string,
): IAutocompleteOption[] => {
  const term = query.trim().toLocaleLowerCase();
  if (term.length < AUTOCOMPLETE_SEARCH.MIN_QUERY_LENGTH) return options;
  return options.filter(option =>
    AUTOCOMPLETE_SEARCH.KEYS.some(key => option[key]?.toLocaleLowerCase().includes(term)),
  );
};

export const getListMaxHeight = (rows: number): number => {
  const visibleRows = clamp({
    value: rows,
    min: AUTOCOMPLETE_LAYOUT.MIN_VISIBLE_ROWS,
    max: AUTOCOMPLETE_LAYOUT.MAX_VISIBLE_ROWS,
  });

  return visibleRows * AUTOCOMPLETE_LAYOUT.ROW_HEIGHT_PX;
};

export const getOptionId = (listId: string, optionValue: string): string =>
  `${listId}-option-${encodeURIComponent(optionValue)}`;

export const getFieldCursor = (disabled: boolean, isTrigger: boolean): TFieldCursor => {
  if (disabled) {
    return "default";
  }

  if (isTrigger) {
    return "pointer";
  }

  return "text";
};

export const getNextActiveIndex = ({ step, current, optionsCount }: IActiveIndexMove): number => {
  const lastIndex = Math.max(0, optionsCount - 1);

  return Math.min(lastIndex, Math.max(0, current + step));
};

export const isNearScrollEnd = (
  element: Pick<HTMLElement, "scrollTop" | "clientHeight" | "scrollHeight">,
): boolean =>
  element.scrollTop + element.clientHeight >=
  element.scrollHeight - AUTOCOMPLETE_LAYOUT.ROW_HEIGHT_PX;

export const isScrollable = (
  element: Pick<HTMLElement, "clientHeight" | "scrollHeight">,
): boolean => element.scrollHeight > element.clientHeight;

export const getComboboxAriaProps = (options: IComboboxAriaOptions): IComboboxAriaAttributes => ({
  role: "combobox",
  "aria-autocomplete": "list",
  "aria-controls": options.listId,
  "aria-expanded": options.isOpen,
  "aria-required": options.required,
  ...(options.hasHint && { "aria-describedby": options.hintId }),
  ...(options.activeOptionId && { "aria-activedescendant": options.activeOptionId }),
});
