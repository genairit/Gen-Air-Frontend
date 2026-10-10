import {
  BUTTON_SIZES,
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import ShowcaseSection from "../ShowcaseSection";
import { useShowcaseStyles } from "../showcase.style";
import Button from "../../../components/Button/Button";
import { noop } from "../../../utilities/function.utility";

const ButtonsSection = () => {
  const styles = useShowcaseStyles();

  return (
    <ShowcaseSection position={2} title="כפתורים">
      <Card gap="28px" padding="32px">
        <Box sx={styles.row({})}>
          <Button onClick={noop} text="צור פרויקט" size={BUTTON_SIZES.LARGE} />
          <Button onClick={noop} text="שמור שינויים" />
          <Button onClick={noop} text="עדכן סיסמה" variant={BUTTON_VARIANTS.SECONDARY} />
          <Button text="ביטול" onClick={noop} variant={BUTTON_VARIANTS.NEUTRAL} />
          <Button onClick={noop} text="מחק פרויקט" variant={BUTTON_VARIANTS.DANGER} />
          <Button disabled onClick={noop} text="לא זמין" variant={BUTTON_VARIANTS.NEUTRAL} />
        </Box>

        <Box sx={styles.row({ gap: "16px" })}>
          <Button
            text="‹"
            onClick={noop}
            ariaLabel="הבא"
            shape={BUTTON_SHAPES.CIRCLE}
            variant={BUTTON_VARIANTS.NEUTRAL}
          />
          <Button
            text="›"
            onClick={noop}
            ariaLabel="הקודם"
            shape={BUTTON_SHAPES.CIRCLE}
            variant={BUTTON_VARIANTS.NEUTRAL}
          />
          <Button onClick={noop} text="לחוץ / פעיל" variant={BUTTON_VARIANTS.PRESSED} />
          <Button onClick={noop} text="+ הוסף שלב סטטוס" variant={BUTTON_VARIANTS.DASHED} />
          <Button onClick={noop} text="הפעל סוכן AI" variant={BUTTON_VARIANTS.DARK} />
        </Box>

        <Box sx={styles.row({ gap: "24px" })}>
          <Box component="span" sx={styles.caption}>
            <b>ראשי</b> — כתום, פעולה אחת לכל מסך
          </Box>
          <Box component="span" sx={styles.caption}>
            <b>משני</b> — Air Blue
          </Box>
          <Box component="span" sx={styles.caption}>
            <b>ניטרלי</b> — מובלט
          </Box>
          <Box component="span" sx={styles.caption}>
            <b>לחוץ</b> — שקוע
          </Box>
        </Box>
      </Card>
    </ShowcaseSection>
  );
};

export default ButtonsSection;
