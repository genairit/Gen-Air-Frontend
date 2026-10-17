import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import ShowcaseSection from "../ShowcaseSection";
import { useShowcaseStyles } from "../showcase.style";
import Button from "../../../components/Button/Button";
import { noop } from "../../../utilities/function.utility";
import { CHIP_VARIANTS } from "../../../constants/chip.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { DEMO_STATUS_STAGES } from "../../../constants/demo-data.constant";
import StageListItem from "../../../components/StageListItem/StageListItem";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

const SettingsSection = () => {
  const styles = useShowcaseStyles();

  return (
    <ShowcaseSection position={9} title="הגדרות מערכת">
      <Box sx={styles.grid({ minColumnWidth: 360 })}>
        <Card gap="16px">
          <CardHeader
            title="ניהול שלבי סטטוס פרויקט"
            subtitle="הגדרה, סידור ועדכון שלבי מחזור החיים"
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
          <Button
            onClick={noop}
            sx={styles.fullWidth}
            text="+ הוסף שלב סטטוס"
            variant={BUTTON_VARIANTS.DASHED}
          />
        </Card>
      </Box>
    </ShowcaseSection>
  );
};

export default SettingsSection;
