import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "../ApartmentImport.style";
import { APARTMENT_IMPORT } from "../../../constants/apartment-import.constant";
import type { IImportFailure } from "../../../interfaces/apartment-import.interface";

interface IServerErrorBannerProps {
  failure: IImportFailure;
}

const ServerErrorBanner: FC<IServerErrorBannerProps> = ({ failure }) => {
  const styles = useStyles();
  const invalidTemplate = failure.code === APARTMENT_IMPORT.INVALID_TEMPLATE;
  const title = invalidTemplate ? "הייבוא נכשל: מבנה הקובץ לא תואם" : failure.title;
  return (
    <Box role="alert" sx={styles.error}>
      <Box component="b">{title}</Box>
      <Box>{failure.message}</Box>
      {invalidTemplate && <Box>לא נוצרה ולא עודכנה אף דירה. יש להשתמש בתבנית הרשמית.</Box>}
      {failure.code && <Box sx={styles.code}>{failure.code}</Box>}
    </Box>
  );
};

export default ServerErrorBanner;
