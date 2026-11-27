import {
  ESTIMATE_PARAM,
  ESTIMATE_STATUS_LABELS,
} from "../../constants/engineering-estimate.constant";

import { usePageStyles } from "../page.style";
import { Box, Typography } from "@mui/material";
import { useRef, useState, type FC } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../../components/Button/Button";
import EstimateJenny from "./components/EstimateJenny";
import { useSessionUser } from "../../store/session.store";
import DataTable from "../../components/DataTable/DataTable";
import EstimateWorkspace from "./components/EstimateWorkspace";
import EstimateCreateForm from "./components/EstimateCreateForm";
import { PERMISSIONS } from "../../constants/permission.constant";
import InlineError from "../../components/InlineError/InlineError";
import { hasPermission } from "../../utilities/permission.utility";
import { focusConnectedElement } from "../../utilities/focus.utility";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import type { IDataTableColumn } from "../../interfaces/data-table.interface";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";
import { useEstimateQuery, useEstimatesQuery } from "../../hooks/engineering-estimate.hook";
import type {
  IEstimateListItem,
  IEngineeringEstimate,
} from "../../interfaces/engineering-estimate.interface";

const LIST_COLUMNS: IDataTableColumn<IEstimateListItem>[] = [
  { id: "name", header: "שם כתב הכמויות", track: "minmax(0, 1fr)", render: row => row.name },
  {
    id: "status",
    header: "סטטוס",
    track: "minmax(75px, 0.25fr)",
    render: row => ESTIMATE_STATUS_LABELS[row.status],
  },
];

const EngineeringEstimatesPage: FC = () => {
  const styles = usePageStyles();
  const user = useSessionUser();
  const [creating, setCreating] = useState(false);
  const createTrigger = useRef<HTMLButtonElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const estimateId = searchParams.get(ESTIMATE_PARAM);
  const list = useEstimatesQuery();
  const detail = useEstimateQuery(estimateId);
  const estimate = detail.data ?? null;
  const canEdit = hasPermission(user, PERMISSIONS.ENGINEERING_ESTIMATES_MANAGE);
  const canApprove = hasPermission(user, PERMISSIONS.ENGINEERING_ESTIMATES_APPROVE);
  const canBrowse = hasPermission(user, PERMISSIONS.DRIVE_READ);
  const canReadQuotation = hasPermission(user, PERMISSIONS.QUOTATIONS_READ);
  const canCreateQuotation = hasPermission(user, PERMISSIONS.QUOTATIONS_CREATE);
  const canExportQuotation = hasPermission(user, PERMISSIONS.QUOTATIONS_EXPORT);
  const isList = estimateId === null;
  const canStartEstimate = isList && canEdit;
  const showCreateForm = canStartEstimate && creating;
  const items = list.data?.pages.flatMap(page => page.items) ?? [];
  const showList = isList && list.isSuccess;
  const activeQuery = isList ? list : detail;
  const cancelCreate = (): void => {
    setCreating(false);
    focusConnectedElement(createTrigger.current);
  };
  const open = (selected: Pick<IEngineeringEstimate, "id">): void => {
    setCreating(false);
    setSearchParams({ [ESTIMATE_PARAM]: selected.id });
  };

  return (
    <Box sx={styles.page}>
      <Box sx={styles.header}>
        <Typography component="h1" sx={styles.heading}>
          כתבי כמויות
        </Typography>
        {canStartEstimate && (
          <Button
            text="כתב כמויות חדש"
            buttonRef={createTrigger}
            ariaExpanded={showCreateForm}
            onClick={(): void => setCreating(true)}
          />
        )}
        {!isList && (
          <Button
            text="לכל כתבי הכמויות"
            variant={BUTTON_VARIANTS.SECONDARY}
            onClick={(): void => setSearchParams({})}
          />
        )}
      </Box>
      {activeQuery.isPending && <LoadingState />}
      {activeQuery.isError && (
        <Box sx={styles.stack({ gap: "12px" })}>
          <InlineError message={getApiErrorMessage(activeQuery.error)} />
          <Button
            text="נסו שוב"
            onClick={async (): Promise<void> => {
              await activeQuery.refetch();
            }}
          />
        </Box>
      )}
      {showCreateForm && (
        <EstimateCreateForm
          onCreated={open}
          onCancel={cancelCreate}
          canLinkProject={hasPermission(user, PERMISSIONS.PROJECTS_READ)}
        />
      )}
      {showList && (
        <DataTable
          minWidth={0}
          rows={items}
          padding="16px"
          onRowClick={open}
          columns={LIST_COLUMNS}
          ariaLabel="רשימת כתבי כמויות"
          getRowId={(row): string => row.id}
          getRowLabel={(row): string => `פתיחת ${row.name}`}
          endAdornment={items.length === 0 && <Typography>אין כתבי כמויות להצגה.</Typography>}
          footer={
            list.hasNextPage && (
              <Button
                text="טענו עוד"
                disabled={list.isFetchingNextPage}
                isLoading={list.isFetchingNextPage}
                onClick={async (): Promise<void> => {
                  await list.fetchNextPage();
                }}
              />
            )
          }
        />
      )}
      {estimate && (
        <EstimateWorkspace
          key={estimate.id}
          canEdit={canEdit}
          estimate={estimate}
          canBrowse={canBrowse}
          canApprove={canApprove}
          canReadQuotation={canReadQuotation}
          canCreateQuotation={canCreateQuotation}
          canExportQuotation={canExportQuotation}
        />
      )}
      {canEdit && (isList || estimate) && (
        <EstimateJenny onCreated={open} estimate={estimate} canBrowse={canBrowse} />
      )}
    </Box>
  );
};

export default EngineeringEstimatesPage;
