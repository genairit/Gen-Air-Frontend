import {
  publicationLabel,
  isPublicationPending,
  publicationDescription,
} from "../../../utilities/quotation-publication.utility";

import {
  PUBLICATION_COPY,
  PUBLICATION_STATE,
} from "../../../constants/quotation-publication.constant";

import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import type { FC } from "react";
import Button from "../../../components/Button/Button";
import { Box, Link, CircularProgress } from "@mui/material";
import { useStyles } from "./QuotationPublicationNotice.style";
import NoticeBanner from "../../../components/NoticeBanner/NoticeBanner";
import type { IQuotationPublicationState } from "../../../interfaces/quotation-publication.interface";
import { NOTICE_VARIANTS } from "../../../vendor/smartbase/components/NoticeCard/constants/notice-card.constant";

const QuotationPublicationNotice: FC<IQuotationPublicationState> = ({
  publication,
  busy,
  error,
  retry,
  refresh,
  refreshing,
  retryRequested = false,
}) => {
  const styles = useStyles();
  const state = publication?.state ?? null;
  const isFailed = state === PUBLICATION_STATE.FAILED;
  const isPending = isPublicationPending(state);
  const publicationTitle = publication === null ? null : publicationLabel(publication);
  const title = error ?? publicationTitle;
  const variant = isFailed || error !== null ? NOTICE_VARIANTS.warning : NOTICE_VARIANTS.info;
  const lines = publication === null ? [] : publicationDescription(publication);
  const keepRetryFocused = retryRequested && isPending;
  const canRetry = publication?.canRetry === true || busy || keepRetryFocused;
  const retryDisabled = busy || isPending;
  const canRefresh = error !== null;
  const fileUrl = publication?.fileUrl ?? null;
  if (title === null) {
    return null;
  }

  return (
    <NoticeBanner
      title={title}
      lines={lines}
      variant={variant}
      actions={
        <Box sx={styles.actions}>
          {isPending && <CircularProgress size={18} sx={styles.progress} aria-label={title} />}
          {canRetry && (
            <Button
              text={PUBLICATION_COPY.RETRY}
              onClick={retry}
              isLoading={busy}
              disabled={retryDisabled}
              size={BUTTON_SIZES.COMPACT}
              variant={BUTTON_VARIANTS.SECONDARY}
            />
          )}
          {canRefresh && (
            <Button
              text={PUBLICATION_COPY.REFRESH}
              onClick={refresh}
              isLoading={refreshing}
              disabled={refreshing}
              size={BUTTON_SIZES.COMPACT}
              variant={BUTTON_VARIANTS.SECONDARY}
            />
          )}
          {fileUrl && (
            <Link href={fileUrl} target="_blank" rel="noopener noreferrer">
              {PUBLICATION_COPY.OPEN}
            </Link>
          )}
        </Box>
      }
    />
  );
};
export default QuotationPublicationNotice;
