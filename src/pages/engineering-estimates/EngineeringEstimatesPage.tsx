import {
  ESTIMATE_PARAM,
  ESTIMATE_STATUS_LABELS,
} from "../../constants/engineering-estimate.constant";

import { useState, type FC } from "react";
import { usePageStyles } from "../page.style";
import Card from "../../components/Card/Card";
import { Box, Typography } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import Button from "../../components/Button/Button";
import EstimateJenny from "./components/EstimateJenny";
import { useSessionUser } from "../../store/session.store";
import EstimateWorkspace from "./components/EstimateWorkspace";
import EstimateCreateForm from "./components/EstimateCreateForm";
import { PERMISSIONS } from "../../constants/permission.constant";
import InlineError from "../../components/InlineError/InlineError";
import { hasPermission } from "../../utilities/permission.utility";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";
import { useEstimateQuery, useEstimatesQuery } from "../../hooks/engineering-estimate.hook";
import type { IEngineeringEstimate } from "../../interfaces/engineering-estimate.interface";

const EngineeringEstimatesPage: FC = () => {
  const styles = usePageStyles();
  const user = useSessionUser();
  const [creating, setCreating] = useState(false);
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
  const items = list.data?.pages.flatMap(page => page.items) ?? [];
  const activeQuery = isList ? list : detail;
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
        {isList && canEdit && !creating && (
          <Button text="כתב כמויות חדש" onClick={(): void => setCreating(true)} />
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
      {isList && canEdit && creating && (
        <EstimateCreateForm
          onCreated={open}
          onCancel={(): void => setCreating(false)}
          canLinkProject={hasPermission(user, PERMISSIONS.PROJECTS_READ)}
        />
      )}
      {isList && list.isSuccess && items.length === 0 && (
        <Typography>אין כתבי כמויות להצגה.</Typography>
      )}
      {isList &&
        items.map((row): React.JSX.Element => (
          <Card key={row.id}>
            <Box sx={styles.spacedRow}>
              <Typography component="strong">{row.name}</Typography>
              <Typography sx={styles.caption}>{ESTIMATE_STATUS_LABELS[row.status]}</Typography>
              <Button
                text={`פתיחת ${row.name}`}
                onClick={(): void => open(row)}
                variant={BUTTON_VARIANTS.SECONDARY}
              />
            </Box>
          </Card>
        ))}
      {isList && list.hasNextPage && (
        <Button
          text="טענו עוד"
          disabled={list.isFetchingNextPage}
          isLoading={list.isFetchingNextPage}
          onClick={async (): Promise<void> => {
            await list.fetchNextPage();
          }}
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
