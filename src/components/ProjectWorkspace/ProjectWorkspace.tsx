import Card from "../Card/Card";
import Tabs from "../Tabs/Tabs";
import { Box } from "@mui/material";
import { useStyles } from "./ProjectWorkspace.style";
import { useId, useState, type ReactNode } from "react";
import { TAB_MODES } from "../../constants/tabs.constant";
import { WorkspaceToolbarContext } from "./WorkspaceToolbar.context";
import { useVisibleActiveTab } from "../../hooks/visible-active-tab.hook";
import { PROJECT_TAB_PARAM } from "../../constants/project-workspace.constant";
import { useProjectWorkspaceQuery } from "../../hooks/project-workspace-query.hook";

interface IPanel {
  id: string;
  label: string;
  content: ReactNode;
  action?: ReactNode;
}

interface IWorkspaceProps {
  panels: IPanel[];
  header: ReactNode;
  defaultTab: string;
  activeTab?: string;
  footer?: ReactNode;
  keepMounted?: boolean;
  onTabChange?: (id: string) => void;
}

const WorkspacePanel = ({
  panel,
  active,
  keepMounted,
  prefix,
  toolbar,
}: {
  panel: IPanel;
  active: boolean;
  keepMounted: boolean;
  prefix: string;
  toolbar: HTMLElement | null;
}) => {
  const styles = useStyles();
  const [visited, setVisited] = useState(active);
  if (active && !visited) setVisited(true);
  return (
    <Box
      tabIndex={0}
      role="tabpanel"
      hidden={!active}
      sx={styles.panel}
      data-project-panel={panel.id}
      id={`${prefix}-panel-${panel.id}`}
      aria-labelledby={`${prefix}-tab-${panel.id}`}
    >
      <WorkspaceToolbarContext.Provider value={active ? toolbar : null}>
        {(keepMounted || active || visited) && panel.content}
      </WorkspaceToolbarContext.Provider>
    </Box>
  );
};

const ProjectWorkspace = ({
  header,
  panels,
  defaultTab,
  activeTab,
  onTabChange,
  keepMounted = false,
  footer,
}: IWorkspaceProps) => {
  const prefix = useId();
  const [toolbar, setToolbar] = useState<HTMLElement | null>(null);
  const styles = useStyles();
  const { params, update } = useProjectWorkspaceQuery();
  const requested = activeTab ?? params.get(PROJECT_TAB_PARAM);
  const activePanel =
    panels.find(panel => panel.id === requested) ?? panels.find(panel => panel.id === defaultTab);
  const selected = activePanel?.id ?? defaultTab;
  const panelActionAttribute = activePanel?.action ? "" : null;
  const tabScroll = useVisibleActiveTab(selected);
  const selectTab = (id: string) => {
    if (id === selected) return;
    if (onTabChange) onTabChange(id);
    else update(PROJECT_TAB_PARAM, id);
  };
  return (
    <Box sx={styles.workspace} data-project-workspace="">
      {header}
      <Card gap="4px" padding="8px" sx={styles.surface}>
        <Box sx={styles.toolbar} data-panel-action={panelActionAttribute}>
          <Box ref={tabScroll} sx={styles.tabBar}>
            <Tabs
              isScrollable
              items={panels}
              activeId={selected}
              onChange={selectTab}
              mode={TAB_MODES.TABS}
              panelIdPrefix={prefix}
              ariaLabel="לשוניות הפרויקט"
            />
          </Box>
          <Box ref={setToolbar} sx={styles.actions}>
            {activePanel?.action}
          </Box>
        </Box>
        {panels.map(panel => (
          <WorkspacePanel
            panel={panel}
            key={panel.id}
            prefix={prefix}
            toolbar={toolbar}
            keepMounted={keepMounted}
            active={panel.id === selected}
          />
        ))}
      </Card>
      {footer && (
        <Box component="footer" sx={styles.footer}>
          {footer}
        </Box>
      )}
    </Box>
  );
};
export default ProjectWorkspace;
