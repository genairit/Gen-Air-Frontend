import { Box } from "@mui/material";
import { useState, type FC } from "react";
import styles from "../quotation.module.css";
import Tabs from "../../../components/Tabs/Tabs";
import QuotationDocument from "./QuotationDocument";
import QuotationItemsTable from "./QuotationItemsTable";
import { TAB_MODES } from "../../../constants/tabs.constant";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { QUOTATION_WORKSPACE_TABS } from "../../../constants/quotation.constant";

interface IQuotationWorkspaceProps {
  disabled: boolean;
  readOnly: boolean;
  quotation: IQuotation;
  onChange: (quotation: IQuotation) => void;
}

const QuotationWorkspace: FC<IQuotationWorkspaceProps> = ({
  quotation,
  disabled,
  readOnly,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState("items");
  return (
    <Box component="div" className={styles.workspace} data-active-pane={activeTab}>
      <Box component="div" className={styles.workspaceTabs}>
        <Tabs
          isFullWidth
          activeId={activeTab}
          mode={TAB_MODES.TABS}
          onChange={setActiveTab}
          ariaLabel="תצוגת ההצעה"
          items={QUOTATION_WORKSPACE_TABS}
        />
      </Box>
      <Box component="div" className={styles.workspacePanes}>
        <Box component="section" aria-label="פריטי ההצעה" className={styles.itemsPane}>
          <QuotationItemsTable
            readOnly={readOnly}
            disabled={disabled}
            onChange={onChange}
            quotation={quotation}
          />
        </Box>
        <Box component="section" aria-label="מסמך ההצעה" className={styles.documentPane}>
          <QuotationDocument quotation={quotation} />
        </Box>
      </Box>
    </Box>
  );
};

export default QuotationWorkspace;
