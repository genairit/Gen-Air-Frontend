import type { FC } from "react";
import { Box } from "@mui/material";
import styles from "../estimate-document.module.css";
import Button from "../../../components/Button/Button";
import { useUnsavedChangesNavigation } from "../../../hooks/unsaved-changes-navigation.hook";

interface IEstimateDraftNavigationProps {
  pending: boolean;
}
const EstimateDraftNavigation: FC<IEstimateDraftNavigationProps> = ({ pending }) => {
  const blocker = useUnsavedChangesNavigation(pending, true);
  if (blocker.state !== "blocked") {
    return null;
  }
  return (
    <Box role="alert" component="section" className={styles.editor}>
      <Box component="p">יש שינויים שטרם נשמרו.</Box>
      <Box component="div" className={styles.actions}>
        <Button text="המשך עריכה" onClick={() => blocker.reset()} />
        <Button text="יציאה ללא שמירה" onClick={() => blocker.proceed()} />
      </Box>
    </Box>
  );
};
export default EstimateDraftNavigation;
