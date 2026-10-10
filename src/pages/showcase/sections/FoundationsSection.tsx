import {
  SHOWCASE_DEPTH_SAMPLES,
  SHOWCASE_COLOR_SWATCHES,
  SHOWCASE_TYPOGRAPHY_SAMPLES,
} from "../../../constants/showcase.constant";

import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import ShowcaseSection from "../ShowcaseSection";
import { useShowcaseStyles } from "../showcase.style";
import { SURFACE_RADII } from "../../../constants/surface.constant";

const FoundationsSection = () => {
  const styles = useShowcaseStyles();

  return (
    <ShowcaseSection position={1} title="יסודות">
      <Box sx={styles.grid({ minColumnWidth: 220 })}>
        {SHOWCASE_COLOR_SWATCHES.map(swatch => (
          <Card padding="18px" key={swatch.name}>
            <Box
              sx={styles.swatch({
                color: swatch.color,
                isInsetPreview: Boolean(swatch.isInsetPreview),
              })}
            />
            <Box sx={styles.stack({ gap: "2px" })}>
              <Box component="b" sx={styles.strong({ fontSize: 16 })}>
                {swatch.name}
              </Box>
              <Box component="bdi" sx={styles.monoCaption}>
                {swatch.color}
              </Box>
              <Box component="span" sx={styles.caption}>
                {swatch.usage}
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      <Box sx={styles.grid({ minColumnWidth: 300 })}>
        <Card padding="28px">
          <Box component="span" sx={styles.label}>
            טיפוגרפיה · Heebo
          </Box>
          {SHOWCASE_TYPOGRAPHY_SAMPLES.map(sample => (
            <Box key={sample.label} sx={styles.typography(sample)}>
              {sample.label}
            </Box>
          ))}
          <Box component="span" sx={styles.caption}>
            משני 13 · סונכרן מול ERP לפני 5 דק׳
          </Box>
          <Box component="span" sx={styles.monoCaption}>
            GA-84920 · EMP-1001
          </Box>
        </Card>

        <Card gap="20px" padding="28px">
          <Box component="span" sx={styles.label}>
            עומק ומשטח
          </Box>
          <Box sx={styles.grid({ minColumnWidth: 80, gap: "20px" })}>
            {SHOWCASE_DEPTH_SAMPLES.map(sample => (
              <Box key={sample.label} sx={styles.centeredLabel}>
                <Card depth={sample.depth} sx={styles.depthSample} radius={SURFACE_RADII.PANEL} />
                {sample.label}
              </Box>
            ))}
          </Box>
          <Box sx={styles.monoTokens}>
            <span>card 24px</span>
            <span>·</span>
            <span>panel 20px</span>
            <span>·</span>
            <span>pill 999px</span>
            <span>·</span>
            <span>target 48–56px</span>
          </Box>
        </Card>
      </Box>
    </ShowcaseSection>
  );
};

export default FoundationsSection;
