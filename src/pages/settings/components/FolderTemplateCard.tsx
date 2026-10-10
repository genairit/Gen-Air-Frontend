import {
  SETTINGS_COPY,
  FOLDER_TEMPLATE_ROOT,
  FOLDER_TEMPLATE_TAGS,
  FOLDER_TEMPLATE_ROOT_BADGE,
} from "../../../constants/settings.constant";

import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import TreePreview from "../../../components/TreePreview/TreePreview";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useDriveTemplateQuery } from "../../../hooks/queries/project.query";
import { flattenTemplateTree } from "../../../utilities/mappers/project.mapper";

const FolderTemplateCard = () => {
  const styles = usePageStyles();
  const templateQuery = useDriveTemplateQuery();

  return (
    <Card gap="16px">
      <CardHeader
        icon={ICON_NAMES.PROJECT_FOLDER}
        title={SETTINGS_COPY.TEMPLATE_TITLE}
        subtitle={SETTINGS_COPY.TEMPLATE_SUBTITLE}
      />
      <Box sx={styles.row({ gap: "8px" })}>
        <Box component="span" sx={styles.caption}>
          {SETTINGS_COPY.TEMPLATE_TAGS_LABEL}
        </Box>
        {FOLDER_TEMPLATE_TAGS.map(tag => (
          <Chip key={tag} label={tag} isMonospace />
        ))}
      </Box>
      {templateQuery.isPending && <LoadingState />}
      {templateQuery.isError && <InlineError message={getApiErrorMessage(templateQuery.error)} />}
      {templateQuery.isSuccess && (
        <TreePreview
          rootLabel={FOLDER_TEMPLATE_ROOT}
          rootBadge={FOLDER_TEMPLATE_ROOT_BADGE}
          nodes={flattenTemplateTree(templateQuery.data)}
        />
      )}
    </Card>
  );
};

export default FolderTemplateCard;
