import {
  FIELD_USER,
  FIELD_DAY_TABS,
  MOBILE_NAV_ITEMS,
  FIELD_CHECKLIST_TASKS,
  FIELD_CHECKLIST_INITIAL_STATE,
} from "../../../constants/showcase.constant";

import { useState } from "react";
import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import Tabs from "../../../components/Tabs/Tabs";
import ShowcaseSection from "../ShowcaseSection";
import { useShowcaseStyles } from "../showcase.style";
import Avatar from "../../../components/Avatar/Avatar";
import Button from "../../../components/Button/Button";
import { noop } from "../../../utilities/function.utility";
import CheckBox from "../../../components/CheckBox/CheckBox";
import TextField from "../../../components/TextField/TextField";
import ChecklistItem from "../../../components/ChecklistItem/ChecklistItem";
import MobileBottomNav from "../../../components/MobileBottomNav/MobileBottomNav";
import { SURFACE_DEPTHS, SURFACE_RADII } from "../../../constants/surface.constant";
import { BUTTON_SIZES } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

const LoginMobileSection = () => {
  const styles = useShowcaseStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("12345678");
  const [isRemembered, setIsRemembered] = useState(true);
  const [activeDayTab, setActiveDayTab] = useState(FIELD_DAY_TABS[0].id);
  const [activeNavId, setActiveNavId] = useState(MOBILE_NAV_ITEMS[0].id);
  const [checkedTasks, setCheckedTasks] = useState(FIELD_CHECKLIST_INITIAL_STATE);

  const handleTaskChange = (taskId: string, isChecked: boolean) =>
    setCheckedTasks(current => ({ ...current, [taskId]: isChecked }));

  return (
    <ShowcaseSection position={11} title="התחברות ומובייל">
      <Box sx={[styles.row({ gap: "40px" }), styles.topAligned, styles.centered]}>
        <Box sx={styles.loginColumn}>
          <Box sx={styles.centeredText}>
            <Box component="b" sx={styles.strong({ fontSize: 26 })}>
              GEN-AIR
            </Box>
            <Box component="span" sx={styles.strong({ fontSize: 22 })}>
              התחברות למערכת
            </Box>
            <Box component="span" sx={styles.caption}>
              ניהול פרויקטים ומערכות מיזוג אוויר מתקדמות
            </Box>
          </Box>

          <Card gap="20px" padding="32px" sx={[styles.fullWidth, styles.elevated]}>
            <TextField
              value={email}
              title="כתובת דוא״ל"
              onChange={setEmail}
              type={FIELD_TYPES.EMAIL}
              placeholder="name@gen-air.co.il"
            />
            <TextField
              title="סיסמה"
              value={password}
              onChange={setPassword}
              type={FIELD_TYPES.PASSWORD}
              titleAction={
                <Box href="#" component="a" sx={styles.link}>
                  שכחת סיסמה?
                </Box>
              }
            />
            <CheckBox value={isRemembered} onChange={setIsRemembered} text="זכור אותי במכשיר זה" />
            <Button
              onClick={noop}
              text="התחבר למערכת"
              sx={styles.fullWidth}
              size={BUTTON_SIZES.LARGE}
            />
            <Box component="span" sx={[styles.caption, styles.textCenter]}>
              חיבור מאובטח SSL 256-bit
            </Box>
          </Card>

          <Box component="span" sx={[styles.caption, styles.textCenter]}>
            {"נתקלת בבעיה? "}
            <Box component="a" sx={styles.link} href="mailto:support@gen-air.co.il">
              support@gen-air.co.il
            </Box>
          </Box>
        </Box>

        <Box sx={styles.phoneFrame}>
          <Box sx={styles.phoneScreen}>
            <Box sx={styles.phoneContent}>
              <Box sx={styles.spacedRow}>
                <Box component="b" sx={styles.strong({ fontSize: 22 })}>
                  היום שלי
                </Box>
                <Avatar size={44} tone={FIELD_USER.avatarTone} initials={FIELD_USER.initials} />
              </Box>
              <Tabs
                isFullWidth
                items={FIELD_DAY_TABS}
                activeId={activeDayTab}
                onChange={setActiveDayTab}
              />
              <Card
                gap="6px"
                padding="16px"
                radius={SURFACE_RADII.PANEL}
                depth={SURFACE_DEPTHS.RAISED_SOFT}
              >
                <Box component="span" sx={styles.monoCaption}>
                  GA-84920
                </Box>
                <Box component="b" sx={styles.strong({ fontSize: 17 })}>
                  מגדל פארק בבלי C
                </Box>
                <Box component="span" sx={styles.caption}>
                  קומה 14 · צנרת VRF
                </Box>
              </Card>
              {FIELD_CHECKLIST_TASKS.map(task => (
                <ChecklistItem
                  key={task.id}
                  label={task.label}
                  checked={checkedTasks[task.id]}
                  onChange={isChecked => handleTaskChange(task.id, isChecked)}
                />
              ))}
            </Box>
            <Box sx={styles.phoneNavigation}>
              <MobileBottomNav
                activeId={activeNavId}
                items={MOBILE_NAV_ITEMS}
                onSelect={setActiveNavId}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </ShowcaseSection>
  );
};

export default LoginMobileSection;
