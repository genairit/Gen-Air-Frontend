import {
  getJennySourceKey,
  canOpenJennySource,
  formatJennySourceLabel,
  getJennySourcePageLabel,
} from "../../../utilities/jenny.utility";

import {
  JENNY_COPY,
  JENNY_SOURCE_NAME_CLASS,
  JENNY_SOURCE_ICON_SIZE_PX,
} from "../../../constants/jenny.constant";

import type { FC } from "react";
import Icon from "../../Icon/Icon";
import { Box } from "@mui/material";
import { useThreadStyles } from "../JennyThread.style";
import { mergeSx } from "../../../utilities/sx.utility";
import { ICON_NAMES } from "../../../constants/icon.constant";
import type { IJennyThreadSource } from "../../../interfaces/jenny.interface";

interface IJennySourcesProps {
  canOpenSources: boolean;
  sources: IJennyThreadSource[];
}

interface IJennySourceProps {
  source: IJennyThreadSource;
}

interface IJennySourceRowProps extends IJennySourceProps {
  canOpenSources: boolean;
}

const SourceDetails: FC<IJennySourceProps> = ({ source }) => {
  const styles = useThreadStyles();
  const pageLabel = getJennySourcePageLabel(source);

  return (
    <>
      <Icon name={ICON_NAMES.DOCUMENT} size={JENNY_SOURCE_ICON_SIZE_PX} />
      <Box component="span" sx={styles.sourceName} className={JENNY_SOURCE_NAME_CLASS}>
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
      <Icon name={ICON_NAMES.OPEN} size={JENNY_SOURCE_ICON_SIZE_PX} />
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
