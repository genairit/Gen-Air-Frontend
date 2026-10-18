import { useState, type KeyboardEvent } from "react";
import { KEY_TYPES, type KeyType } from "../constants/keyboard.constant";

interface IUseListNavigationOptions {
  itemCount: number;
  isEnabled: boolean;
  onEscape: () => void;
  onSelect: (index: number) => void;
}

type TListKeyHandler = () => void;

const isListKey = (key: string): key is KeyType =>
  Object.values(KEY_TYPES).some(listKey => listKey === key);

const wrapIndex = (index: number, itemCount: number) => (index + itemCount) % itemCount;

export const useListNavigation = ({
  onSelect,
  onEscape,
  itemCount,
  isEnabled,
}: IUseListNavigationOptions) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const hasItems = itemCount > 0;
  const boundedActiveIndex = Math.min(activeIndex, Math.max(itemCount - 1, 0));

  const moveActiveIndex = (delta: number) => {
    if (!hasItems) {
      return;
    }

    setActiveIndex(wrapIndex(boundedActiveIndex + delta, itemCount));
  };

  const selectActiveItem = () => {
    if (!hasItems) {
      return;
    }

    onSelect(boundedActiveIndex);
  };

  const KEY_HANDLERS: Record<KeyType, TListKeyHandler> = {
    [KEY_TYPES.ESCAPE]: onEscape,
    [KEY_TYPES.ENTER]: selectActiveItem,
    [KEY_TYPES.ARROW_UP]: () => moveActiveIndex(-1),
    [KEY_TYPES.ARROW_DOWN]: () => moveActiveIndex(1),
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isEnabled || !isListKey(event.key)) {
      return;
    }

    event.preventDefault();
    KEY_HANDLERS[event.key]();
  };

  const resetActiveIndex = () => setActiveIndex(0);

  return { activeIndex: boundedActiveIndex, handleKeyDown, resetActiveIndex };
};
