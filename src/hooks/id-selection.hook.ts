import { useState } from "react";
import { toggleItem } from "../utilities/array.utility";

export const useIdSelection = (visibleIds: string[]) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const hasVisibleIds = visibleIds.length > 0;
  const isAllSelected = hasVisibleIds && visibleIds.every(id => selectedIds.includes(id));

  const toggle = (id: string) => setSelectedIds(current => toggleItem(current, id));

  const clear = () => setSelectedIds([]);

  const toggleAll = () => setSelectedIds(isAllSelected ? [] : visibleIds);

  const isSelected = (id: string) => selectedIds.includes(id);

  return { selectedIds, isAllSelected, toggle, toggleAll, isSelected, clear };
};
