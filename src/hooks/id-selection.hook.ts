import { useState } from "react";
import { toggleItem } from "../utilities/array.utility";

const NO_IDS: string[] = [];

export const useIdSelection = (visibleIds: string[], initialIds: string[] = NO_IDS) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  const hasVisibleIds = visibleIds.length > 0;
  const isAllSelected = hasVisibleIds && visibleIds.every(id => selectedIds.includes(id));

  const toggle = (id: string) => setSelectedIds(current => toggleItem(current, id));

  const clear = () => setSelectedIds([]);

  const reset = () => setSelectedIds(initialIds);

  const toggleAll = () => setSelectedIds(isAllSelected ? [] : visibleIds);

  const isSelected = (id: string) => selectedIds.includes(id);

  return { selectedIds, isAllSelected, toggle, toggleAll, isSelected, clear, reset };
};
