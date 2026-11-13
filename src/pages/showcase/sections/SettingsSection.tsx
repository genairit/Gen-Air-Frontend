import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import ShowcaseSection from "../ShowcaseSection";
import { useShowcaseStyles } from "../showcase.style";
import { CHIP_VARIANTS } from "../../../constants/chip.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { DEMO_STATUS_STAGES } from "../../../constants/demo-data.constant";
import StageListItem from "../../../components/StageListItem/StageListItem";

const SettingsSection = () => {
  const styles = useShowcaseStyles();

  return (
    <ShowcaseSection position={9} title="הגדרות מערכת">
      <Box sx={styles.grid({ minColumnWidth: 360 })}>
        <Card gap="16px">
          <CardHeader
            title="סטטוסי פרויקט קבועים"
            subtitle="שמות הסטטוסים וסדרם קבועים"
            action={<Chip label="4 שלבים" variant={CHIP_VARIANTS.INSET} />}
          />
          {DEMO_STATUS_STAGES.map((stage, index) => (
            <StageListItem
              key={stage.id}
              tag={stage.tag}
              name={stage.name}
              position={index + 1}
              description={stage.description}
            />
          ))}
        </Card>
      </Box>
    </ShowcaseSection>
  );
};

export default SettingsSection;
