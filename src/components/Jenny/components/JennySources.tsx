import {
  getJennySourceKey,
  canOpenJennySource,
  formatJennySourceLabel,
  getJennySourcePageLabel,
} from "../../../utilities/jenny.utility";

import type { FC } from "react";
import Icon from "../../Icon/Icon";
import { Box } from "@mui/material";
import { useThreadStyles } from "../JennyThread.style";
import { mergeSx } from "../../../utilities/sx.utility";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { JENNY_COPY } from "../../../constants/jenny.constant";
import type { IJennySource } from "../../../interfaces/jenny.interface";

interface IJennySourcesProps {
  sources: IJennySource[];
  canOpenSources: boolean;
}

interface IJennySourceProps {
  source: IJennySource;
}

interface IJennySourceRowProps extends IJennySourceProps {
  canOpenSources: boolean;
}

const SourceDetails: FC<IJennySourceProps> = ({ source }) => {
  const styles = useThreadStyles();
  const pageLabel = getJennySourcePageLabel(source);

  return (
    <>
      <Icon size={16} name={ICON_NAMES.DOCUMENT} />
      <Box component="span" sx={styles.sourceName} className="jenny-source-name">
        <Box component="bdi">{source.fileName}</Box>
      </Box>
      {pageLabel && (
        <Box component="span" sx={styles.sourcePage}>
          {pageLabel}
        </Box>
      )}
    </>
  );
};

const SourceLink: FC<IJennySourceProps> = ({ source }) => {
  const styles = useThreadStyles();

  return (
    <Box
      component="a"
      target="_blank"
      href={source.url}
      rel="noopener noreferrer"
      aria-label={formatJennySourceLabel(source)}
      sx={mergeSx(styles.sourceRow, styles.sourceLink)}
    >
      <SourceDetails source={source} />
      <Icon size={16} name={ICON_NAMES.OPEN} />
    </Box>
  );
};

const SourceText: FC<IJennySourceProps> = ({ source }) => {
  const styles = useThreadStyles();

  return (
    <Box sx={styles.sourceRow}>
      <SourceDetails source={source} />
    </Box>
  );
};

const SourceRow: FC<IJennySourceRowProps> = ({ source, canOpenSources }) => {
  if (!canOpenJennySource({ source, canOpenSources })) {
    return <SourceText source={source} />;
  }

  return <SourceLink source={source} />;
};

const JennySources: FC<IJennySourcesProps> = ({ sources, canOpenSources }) => {
  const styles = useThreadStyles();

  if (sources.length === 0) {
    return null;
  }

  return (
    <Box sx={styles.sources}>
      <Box component="p" sx={styles.sourcesLabel}>
        {JENNY_COPY.SOURCES}
      </Box>
      <Box component="ul" sx={styles.sourceList}>
        {sources.map(source => (
          <Box component="li" key={getJennySourceKey(source)}>
            <SourceRow source={source} canOpenSources={canOpenSources} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default JennySources;
