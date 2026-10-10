import { useState } from "react";
import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import ShowcaseSection from "../ShowcaseSection";
import { useShowcaseStyles } from "../showcase.style";
import Switch from "../../../components/Switch/Switch";
import CheckBox from "../../../components/CheckBox/CheckBox";
import TextField from "../../../components/TextField/TextField";
import { validateFreeText } from "../../../utilities/validators";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import RadioButton from "../../../components/RadioButton/RadioButton";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { PROJECT_STATUS_OPTIONS } from "../../../constants/showcase.constant";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

const InputsSection = () => {
  const styles = useShowcaseStyles();
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [isRemembered, setIsRemembered] = useState(true);
  const [isNotifying, setIsNotifying] = useState(true);
  const [isRadioSelected, setIsRadioSelected] = useState(true);
  const [password, setPassword] = useState("genair2026");
  const [invalidEmail, setInvalidEmail] = useState("aviad@gen-air");
  const [projectName, setProjectName] = useState("מגדל בבלי Horizon C");
  const [projectStatus, setProjectStatus] = useState<string | null>(PROJECT_STATUS_OPTIONS[0]);

  return (
    <ShowcaseSection position={3} title="שדות קלט">
      <Card padding="32px" sx={styles.grid({ minColumnWidth: 260, gap: "28px 24px" })}>
        <TextField
          isRequired
          value={projectName}
          type={FIELD_TYPES.TEXT}
          onChange={setProjectName}
          validator={validateFreeText}
          title="שם הפרויקט / כותרת הנדסית"
          infoText="הכותרת הרשמית בכל חישובי ההנדסה וההזמנות"
        />
        <TextField
          isRequired
          value={email}
          title="כתובת דוא״ל"
          onChange={setEmail}
          type={FIELD_TYPES.EMAIL}
          placeholder="name@gen-air.co.il"
        />
        <Autocomplete
          title="סטטוס פרויקט"
          value={projectStatus}
          isAutocomplete={false}
          onChange={setProjectStatus}
          options={PROJECT_STATUS_OPTIONS}
        />
        <TextField
          title="חיפוש"
          value={search}
          onChange={setSearch}
          type={FIELD_TYPES.SEARCH}
          placeholder="חיפוש פרויקטים, מזהה או קבלן..."
        />
        <TextField
          value={password}
          titleHint="(מוצפנת)"
          title="סיסמה ראשונית"
          onChange={setPassword}
          type={FIELD_TYPES.PASSWORD}
        />
        <TextField
          title="כתובת דוא״ל"
          value={invalidEmail}
          type={FIELD_TYPES.EMAIL}
          onChange={setInvalidEmail}
        />

        <Box sx={[styles.fullRow, styles.stack({ gap: "18px" })]}>
          <Box sx={styles.row({ gap: "36px" })}>
            <CheckBox value={isRemembered} onChange={setIsRemembered} text="זכור אותי במכשיר זה" />
            <Switch value={isNotifying} onChange={setIsNotifying} label="התראות Slack ודוא״ל" />
            <RadioButton
              label="כפתור רדיו נבחר"
              checked={isRadioSelected}
              onSelect={() => setIsRadioSelected(!isRadioSelected)}
            />
          </Box>
          <Box sx={styles.narrow}>
            <ProgressBar value={58} caption="7 / 12" title="התקדמות צ׳קליסט שטח" />
          </Box>
        </Box>
      </Card>
    </ShowcaseSection>
  );
};

export default InputsSection;
