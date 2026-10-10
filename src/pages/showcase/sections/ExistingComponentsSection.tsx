import {
  FREE_TEXT_ENDPOINT,
  SIMULATED_REQUEST_DELAY_MS,
} from "../../../constants/showcase.constant";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import Card from "../../../components/Card/Card";
import ShowcaseSection from "../ShowcaseSection";
import { useShowcaseStyles } from "../showcase.style";
import Button from "../../../components/Button/Button";
import Toggle from "../../../components/Toggle/Toggle";
import { noop, wait } from "../../../utilities/function.utility";
import DatePicker from "../../../components/DatePicker/DatePicker";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import FreeTextInput from "../../../components/FreeTextInput/FreeTextInput";
import UltraSignature from "../../../components/UltraSignature/UltraSignature";
import type { IDateRange } from "../../../components/DatePicker/interfaces/date-range.interface";

const ExistingComponentsSection = () => {
  const styles = useShowcaseStyles();
  const [freeText, setFreeText] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [toggleValue, setToggleValue] = useState(true);
  const [singleDate, setSingleDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<IDateRange>({ startDate: null, endDate: null });

  const handleAsyncConfirm = () => wait(SIMULATED_REQUEST_DELAY_MS);

  return (
    <ShowcaseSection position={12} title="רכיבים כלליים נוספים">
      <Box sx={styles.grid({ minColumnWidth: 340 })}>
        <Card>
          <Box component="span" sx={styles.label}>
            DatePicker
          </Box>
          <DatePicker isRange={false} value={singleDate} onChange={setSingleDate} />
          <DatePicker isRange value={dateRange} onChange={setDateRange} />
        </Card>

        <Card>
          <Box component="span" sx={styles.label}>
            Toggle
          </Box>
          <Toggle
            value={toggleValue}
            setValue={setToggleValue}
            firstValuePlaceHolder="אפשרות א"
            secondValuePlaceHolder="אפשרות ב"
          />
          <Box component="span" sx={styles.label}>
            FreeTextInput
          </Box>
          <FreeTextInput
            value={freeText}
            title="תיאור חופשי"
            onChange={setFreeText}
            placeholder="הקלד תיאור"
            validationEndpoint={FREE_TEXT_ENDPOINT}
          />
        </Card>

        <Card>
          <Box component="span" sx={styles.label}>
            UltraSignature
          </Box>
          <UltraSignature isSigned={isSigned} setIsSigned={setIsSigned} />
          <Box component="span" sx={styles.label}>
            GenericPopup
          </Box>
          <Button text="פתיחת פופאפ" sx={styles.alignStart} onClick={() => setIsPopupOpen(true)} />
          <GenericPopup
            icon="WARNING"
            align="center"
            open={isPopupOpen}
            title="אישור פעולה"
            onClose={() => setIsPopupOpen(false)}
            guidelines="לא ניתן לבטל את הפעולה לאחר האישור"
            content={<Typography>האם להמשיך בפעולה?</Typography>}
            buttons={{
              primary: { text: "אישור", onClick: handleAsyncConfirm },
              secondary: { text: "ביטול", onClick: noop },
            }}
          />
        </Card>
      </Box>
    </ShowcaseSection>
  );
};

export default ExistingComponentsSection;
