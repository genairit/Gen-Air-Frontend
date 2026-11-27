import { usePageStyles } from "../page.style";
import { Box, Typography } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import Button from "../../components/Button/Button";
import EstimateJenny from "./components/EstimateJenny";
import { useSessionUser } from "../../store/session.store";
import { useEffect, useRef, useState, type FC } from "react";
import DataTable from "../../components/DataTable/DataTable";
import EstimateWorkspace from "./components/EstimateWorkspace";
import EstimateCreateForm from "./components/EstimateCreateForm";
import { useEstimateStyles } from "./engineering-estimates.style";
import { PERMISSIONS } from "../../constants/permission.constant";
import InlineError from "../../components/InlineError/InlineError";
import { hasPermission } from "../../utilities/permission.utility";
import { focusConnectedElement } from "../../utilities/focus.utility";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { ESTIMATE_PARAM } from "../../constants/engineering-estimate.constant";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";
import { useEstimateQuery, useEstimatesQuery } from "../../hooks/engineering-estimate.hook";
import type { IEngineeringEstimate } from "../../interfaces/engineering-estimate.interface";
import { ESTIMATE_LIST_COLUMNS } from "../../constants/engineering-estimate-columns.constant";

const EngineeringEstimatesPage: FC = () => {
  const styles = usePageStyles();
  const estimateStyles = useEstimateStyles();
  const user = useSessionUser();
  const [creating, setCreating] = useState(false);
  const restoreCreateFocus = useRef(false);
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
  const showList = isList && list.isSuccess && !showCreateForm;
  const showCreateAction = canStartEstimate && !showCreateForm;
  const showJenny = canEdit && (isList || estimate !== null) && !showCreateForm;
  const pageTitle = showCreateForm ? "כתב כמויות חדש" : (estimate?.name ?? "כתבי כמויות");
  const activeQuery = isList ? list : detail;
  const showLoading = !showCreateForm && activeQuery.isPending;
  const showError = !showCreateForm && activeQuery.isError;
  useEffect((): void => {
    if (!showCreateForm && restoreCreateFocus.current) {
      restoreCreateFocus.current = false;
      focusConnectedElement(createTrigger.current);
    }
  }, [showCreateForm]);

  const cancelCreate = (): void => {
    restoreCreateFocus.current = true;
    setCreating(false);
  };
  const open = (selected: Pick<IEngineeringEstimate, "id">): void => {
    setCreating(false);
    setSearchParams({ [ESTIMATE_PARAM]: selected.id });
  };

  return (
    <Box sx={styles.page}>
      <Box sx={styles.header}>
        <Typography component="h1" sx={estimateStyles.title}>
          {pageTitle}
        </Typography>
        {showCreateAction && (
          <Button
            text="כתב כמויות חדש"
            buttonRef={createTrigger}
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
      {showLoading && <LoadingState />}
      {showError && (
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
          ariaLabel="רשימת כתבי כמויות"
          columns={ESTIMATE_LIST_COLUMNS}
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
      {showJenny && <EstimateJenny onCreated={open} estimate={estimate} canBrowse={canBrowse} />}
    </Box>
  );
};

export default EngineeringEstimatesPage;
