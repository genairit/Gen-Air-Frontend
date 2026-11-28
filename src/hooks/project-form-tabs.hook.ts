import { useRef, useState, useLayoutEffect } from "react";
import { useProjectWorkspaceQuery } from "./project-workspace-query.hook";
import { PROJECT_TABS, PROJECT_TAB_PARAM } from "../constants/project-workspace.constant";

export const useProjectFormTabs = () => {
  const { params, update } = useProjectWorkspaceQuery();
  const requested = params.get(PROJECT_TAB_PARAM);
  const activeTab =
    requested === PROJECT_TABS.technical.id || requested === PROJECT_TABS.people.id
      ? requested
      : PROJECT_TABS.details.id;
  const setActiveTab = (id: string) => update(PROJECT_TAB_PARAM, id);
  const [target, setTarget] = useState<{ id: string; selector?: string } | null>(null);

  const focused = useRef<typeof target>(null);
  useLayoutEffect(() => {
    if (!target || focused.current === target || activeTab !== target.id) return;
    const panel = document.querySelector<HTMLElement>(
      `[data-project-panel="${activeTab}"]:not([hidden])`,
    );
    const control =
      (target.selector && panel?.querySelector<HTMLElement>(target.selector)) ||
      panel?.querySelector<HTMLElement>('[aria-invalid="true"],input:invalid') ||
      panel;
    control?.focus();
    focused.current = target;
  }, [activeTab, target]);

  const focusError = (id: string, selector?: string) => {
    setActiveTab(id);
    setTarget({ id, selector });
  };
  return { activeTab, setActiveTab, focusError };
};
