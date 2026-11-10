import {
  formatRemovalNotice,
  formatBuildingSubtitle,
} from "../../../../utilities/quotation-sharing.utility";

import {
  QUOTATION_SHARING_COPY,
  QUOTATION_SHARING_ANCHOR,
} from "../../../../constants/quotation-sharing.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import Card from "../../../../components/Card/Card";
import Switch from "../../../../components/Switch/Switch";
import Button from "../../../../components/Button/Button";
import { useStyles } from "./QuotationApartmentSharing.style";
import QuotationSharingSummary from "./QuotationSharingSummary";
import QuotationSharingActions from "./QuotationSharingActions";
import { ICON_NAMES } from "../../../../constants/icon.constant";
import QuotationApartmentPicker from "./QuotationApartmentPicker";
import CardHeader from "../../../../components/CardHeader/CardHeader";
import InlineError from "../../../../components/InlineError/InlineError";
import NoticeBanner from "../../../../components/NoticeBanner/NoticeBanner";
import LoadingState from "../../../../components/LoadingState/LoadingState";
import type { IQuotation } from "../../../../interfaces/quotation.interface";
import { getApiErrorMessage } from "../../../../utilities/api-error.utility";
import QuotationUnavailableApartments from "./QuotationUnavailableApartments";
import { useHashTargetFocus } from "../../../../hooks/hash-target-focus.hook";
import { BUTTON_VARIANTS } from "../../../../components/Button/constants/button.constants";
import type { TQuotationApartmentSharing } from "../../../../hooks/quotation-apartment-sharing.hook";

interface IQuotationApartmentSharingCardProps {
  canEdit: boolean;
  quotation: IQuotation;
  sharing: TQuotationApartmentSharing;
}

const QuotationApartmentSharingCard: FC<IQuotationApartmentSharingCardProps> = ({
  canEdit,
  sharing,
  quotation,
}) => {
  const styles = useStyles();
  const { optionsQuery } = sharing;
  useHashTargetFocus({
    ready: !optionsQuery.isLoading,
    targetId: QUOTATION_SHARING_ANCHOR.CARD_ID,
    focusId: QUOTATION_SHARING_ANCHOR.HEADING_ID,
  });

  const sharedCount = sharing.savedIds.length;
  const hasUnavailableLinks = sharing.unavailableLinks.length > 0;
  const showPicker = sharing.isEnabled && optionsQuery.isSuccess && !sharing.hasNoApartments;
  const showActions = sharing.isEnabled || sharing.isDirty;
  const showRemovalNotice = sharing.removedCount > 0;
  const notApprovedCaptionId = sharing.isApproved ? null : QUOTATION_SHARING_ANCHOR.CAPTION_ID;
  const retryOptions = async () => {
    await optionsQuery.refetch();
  };

  return (
    <Box
      sx={styles.anchor}
      component="section"
      id={QUOTATION_SHARING_ANCHOR.CARD_ID}
      aria-labelledby={QUOTATION_SHARING_ANCHOR.HEADING_ID}
    >
      <Card gap="16px">
        <CardHeader
          focusableTitle
          titleElement="h2"
          icon={ICON_NAMES.BUILDING}
          title={QUOTATION_SHARING_COPY.TITLE}
          subtitle={formatBuildingSubtitle(quotation)}
          titleId={QUOTATION_SHARING_ANCHOR.HEADING_ID}
        />
        {!canEdit && <QuotationSharingSummary sharedCount={sharedCount} />}
        {canEdit && (
          <>
            <Switch
              value={sharing.isEnabled}
              onChange={sharing.toggleSharing}
              describedBy={notApprovedCaptionId}
              disabled={sharing.isSwitchDisabled}
              label={QUOTATION_SHARING_COPY.SWITCH}
            />
            {!sharing.isApproved && (
              <Box component="span" sx={styles.caption} id={QUOTATION_SHARING_ANCHOR.CAPTION_ID}>
                {QUOTATION_SHARING_COPY.NOT_APPROVED}
              </Box>
            )}
            {optionsQuery.isPending && <LoadingState label={QUOTATION_SHARING_COPY.LOADING} />}
            {optionsQuery.isError && (
              <>
                <InlineError message={getApiErrorMessage(optionsQuery.error)} />
                <Button
                  onClick={retryOptions}
                  variant={BUTTON_VARIANTS.NEUTRAL}
                  text={QUOTATION_SHARING_COPY.RETRY}
                />
              </>
            )}
            {sharing.hasNoApartments && (
              <Box component="span" sx={styles.caption}>
                {QUOTATION_SHARING_COPY.NO_APARTMENTS}
              </Box>
            )}
            {showPicker && <QuotationApartmentPicker sharing={sharing} />}
            {showRemovalNotice && (
              <NoticeBanner
                lines={[QUOTATION_SHARING_COPY.REMOVAL_DETAIL]}
                title={formatRemovalNotice(sharing.removedCount)}
              />
            )}
            {sharing.saveError && <InlineError message={getApiErrorMessage(sharing.saveError)} />}
            <QuotationSharingSummary sharedCount={sharedCount} isSaved={sharing.isSaved} />
            {showActions && <QuotationSharingActions sharing={sharing} />}
          </>
        )}
        {hasUnavailableLinks && <QuotationUnavailableApartments links={sharing.unavailableLinks} />}
        <Box component="span" sx={styles.caption}>
          {QUOTATION_SHARING_COPY.FUTURE_APARTMENTS}
        </Box>
      </Card>
    </Box>
  );
};

export default QuotationApartmentSharingCard;
