import { Box } from "@mui/material";
import { useStyles } from "./ShowcaseHeader.style";
import { useShowcaseStyles } from "./showcase.style";

const ShowcaseHeader = () => {
  const styles = useStyles();
  const showcaseStyles = useShowcaseStyles();

  return (
    <Box component="header" sx={showcaseStyles.spacedRow}>
      <Box sx={showcaseStyles.stack({ gap: "8px" })}>
        <Box component="span" sx={styles.eyebrow}>
          GENAIR CRM · UI KIT
        </Box>
        <Box component="h1" sx={styles.title}>
          ספריית רכיבים
        </Box>
        <Box component="p" sx={styles.description}>
          שפת עיצוב Soft-UI אחידה — רכיבים מובלטים מהרקע, כפתורי גלולה, ושדות קלט שקועים. אותם
          רכיבים בדסקטופ ובשטח.
        </Box>
      </Box>
      <Box sx={showcaseStyles.row({ gap: "12px" })}>
        <Box component="span" sx={styles.versionBadge}>
          v1.0
        </Box>
        <Box component="span" sx={styles.localeBadge}>
          RTL · עברית
        </Box>
      </Box>
    </Box>
  );
};

export default ShowcaseHeader;
