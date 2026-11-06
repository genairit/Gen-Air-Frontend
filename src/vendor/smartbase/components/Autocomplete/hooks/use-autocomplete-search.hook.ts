import {
  useRef,
  useMemo,
  useState,
  useEffect,
  type UIEvent,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import {
  isScrollable,
  isNearScrollEnd,
  getNextActiveIndex,
  filterOptionsByQuery,
} from "../utilities/autocomplete.utility";

import {
  type IAutocompleteOption,
  type IUseAutocompleteSearchResult,
  type IUseAutocompleteSearchOptions,
} from "../../../interfaces/autocomplete.interface";

import { KEY_TYPES } from "../../../constants/keyboard.constant";

export const useAutocompleteSearch = ({
  value,
  options,
  pageSize,
  onChange,
  isLoading,
  onLoadMore,
  onSearch,
  autoFocusSearch = false,
}: IUseAutocompleteSearchOptions): IUseAutocompleteSearchResult => {
  const [query, setQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(pageSize);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !autoFocusSearch) return;
    const frame = window.requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, autoFocusSearch]);

  const filteredOptions = useMemo(() => filterOptionsByQuery(options, query), [options, query]);

  const visibleOptions = filteredOptions.slice(0, visibleCount);
  const selectedOption =
    options.find(option => option.value === value) ?? (value ? { value, label: value } : null);
  const highlightedOption = visibleOptions[activeIndex] ?? null;
  const activeOption = isOpen ? highlightedOption : null;
  const isEmpty = filteredOptions.length === 0 && !isLoading;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  useEffect(() => {
    const list = listRef.current;
    const hasHiddenOptions = visibleCount < filteredOptions.length;

    if (!isOpen || !list || !hasHiddenOptions) {
      return;
    }

    const isWaitingAtBottom = !isScrollable(list) || isNearScrollEnd(list);

    if (!isWaitingAtBottom) {
      return;
    }

    setVisibleCount(count => count + pageSize);
  }, [isOpen, pageSize, visibleCount, filteredOptions.length]);

  const resetSearch = (): void => {
    setQuery("");
    setActiveIndex(0);
    setVisibleCount(pageSize);
  };

  const requestFirstPage = (): void => {
    if (options.length > 0 || isLoading) {
      return;
    }

    onLoadMore?.();
  };

  const openSearch = (): void => {
    if (isOpen) {
      return;
    }

    resetSearch();
    onSearch?.("");
    setIsOpen(true);
    requestFirstPage();
  };

  const closeSearch = (): void => {
    setIsOpen(false);
  };

  const typeQuery = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    resetSearch();
    setIsOpen(true);
    setQuery(event.target.value);
    onSearch?.(event.target.value);
  };

  const selectOption = (option: IAutocompleteOption): void => {
    onChange(option.value);
    onSearch?.("");
    closeSearch();
    inputRef.current?.blur();
  };

  const clearValue = (): void => {
    onChange(null);
    resetSearch();
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const clearQuery = (): void => {
    resetSearch();
    onSearch?.("");
    searchInputRef.current?.focus();
  };

  const revealMoreOptions = (): void => {
    if (visibleCount < filteredOptions.length) {
      setVisibleCount(count => count + pageSize);

      return;
    }

    if (isLoading) {
      return;
    }

    onLoadMore?.();
  };

  const handleListScroll = (event: UIEvent<HTMLDivElement>): void => {
    if (!isNearScrollEnd(event.currentTarget)) {
      return;
    }

    revealMoreOptions();
  };

  const moveActiveIndex = (event: KeyboardEvent<HTMLElement>, step: number): void => {
    event.preventDefault();

    if (!isOpen) {
      openSearch();

      return;
    }

    const optionsCount = visibleOptions.length;
    const nextIndex = getNextActiveIndex({ step, current: activeIndex, optionsCount });

    setActiveIndex(nextIndex);

    if (nextIndex === optionsCount - 1) {
      revealMoreOptions();
    }
  };

  const handleEscape = (event: KeyboardEvent<HTMLElement>): void => {
    if (!isOpen) {
      return;
    }

    event.preventDefault();
    closeSearch();
  };

  const handleEnter = (event: KeyboardEvent<HTMLElement>): void => {
    if (!isOpen) {
      event.preventDefault();
      openSearch();
      return;
    }

    if (!activeOption) {
      return;
    }

    event.preventDefault();
    selectOption(activeOption);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const handlers = new Map<string, (event: KeyboardEvent<HTMLElement>) => void>([
      [KEY_TYPES.ENTER, handleEnter],
      [KEY_TYPES.ESCAPE, handleEscape],
      [KEY_TYPES.ARROW_UP, event => moveActiveIndex(event, -1)],
      [KEY_TYPES.ARROW_DOWN, event => moveActiveIndex(event, 1)],
    ]);

    handlers.get(event.key)?.(event);
  };

  return {
    query,
    isOpen,
    isEmpty,
    listRef,
    inputRef,
    typeQuery,
    clearQuery,
    clearValue,
    openSearch,
    activeIndex,
    closeSearch,
    activeOption,
    selectOption,
    handleKeyDown,
    searchInputRef,
    selectedOption,
    visibleOptions,
    setActiveIndex,
    handleListScroll,
  };
};
