import {
  SHARED_DOCUMENT_COPY,
  SHARED_DOCUMENT_STATUS,
} from "../../../constants/shared-document.constant";

import type { FC } from "react";
import { Alert, Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import FileRow from "../../../components/FileRow/FileRow";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useSharedDocumentQuery } from "../../../hooks/queries/project.query";

interface ISharedProjectDocumentCardProps {
  apartmentId: string;
}

const SharedProjectDocumentCard: FC<ISharedProjectDocumentCardProps> = ({ apartmentId }) => {
  const query = useSharedDocumentQuery(apartmentId);
  const file = query.data?.file;

  return (
    <Box component="section" aria-label={SHARED_DOCUMENT_COPY.CHILD_TITLE}>
      <Card gap="18px">
        <CardHeader icon={ICON_NAMES.GDRIVE} title={SHARED_DOCUMENT_COPY.CHILD_TITLE} />
        {query.isPending && <LoadingState label="טוען מסמך משותף..." />}
        {query.isError && <InlineError message={getApiErrorMessage(query.error)} />}
        {query.data?.status === SHARED_DOCUMENT_STATUS.NONE && (
          <Alert severity="info">{SHARED_DOCUMENT_COPY.CHILD_EMPTY}</Alert>
        )}
        {query.data?.status === SHARED_DOCUMENT_STATUS.UNAVAILABLE && (
          <Alert severity="warning">{SHARED_DOCUMENT_COPY.CHILD_UNAVAILABLE}</Alert>
        )}
        {query.data?.status === SHARED_DOCUMENT_STATUS.AVAILABLE && file && (
          <FileRow
            linkLabel={SHARED_DOCUMENT_COPY.OPEN}
            file={{
              id: file.id,
              name: file.name,
              url: file.url,
              meta: "מפרויקט האב",
              icon: ICON_NAMES.DOCUMENT,
            }}
          />
        )}
      </Card>
    </Box>
  );
};

export default SharedProjectDocumentCard;
