import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "../../Button/Button";
import { useStyles } from "../ApartmentImport.style";
import { BUTTON_VARIANTS } from "../../Button/constants/button.constants";
import { APARTMENT_IMPORT } from "../../../constants/apartment-import.constant";
import type { IImportFailure } from "../../../interfaces/apartment-import.interface";

interface IServerErrorBannerProps {
  onRetry: () => void;
  failure: IImportFailure;
  onDownloadTemplate: () => Promise<void>;
}

const ServerErrorBanner: FC<IServerErrorBannerProps> = ({
  failure,
  onRetry,
  onDownloadTemplate,
}) => {
  const styles = useStyles();
  const invalidTemplate = failure.code === APARTMENT_IMPORT.INVALID_TEMPLATE;
  const title = invalidTemplate ? "הייבוא נכשל: מבנה הקובץ לא תואם" : failure.title;
  const retryText = invalidTemplate ? "העלה קובץ אחר" : "נסה קובץ אחר";
  const retryVariant = invalidTemplate ? BUTTON_VARIANTS.PRIMARY : BUTTON_VARIANTS.NEUTRAL;
  const errorCode = invalidTemplate
    ? `${APARTMENT_IMPORT.INVALID_TEMPLATE_STATUS} · ${failure.code}`
    : failure.code;
  return (
    <Box role="alert" sx={styles.error}>
      <Box sx={styles.errorText}>
        <Box component="b">{title}</Box>
        <Box>{failure.message}</Box>
        {invalidTemplate && <Box>לא נוצרה ולא עודכנה אף דירה. יש להשתמש בתבנית הרשמית.</Box>}
        {errorCode && (
          <Box dir="ltr" sx={styles.code}>
            {errorCode}
          </Box>
        )}
      </Box>
      <Box sx={styles.actions}>
        {invalidTemplate && (
          <Button
            text="הורד תבנית"
            onClick={onDownloadTemplate}
            variant={BUTTON_VARIANTS.NEUTRAL}
          />
        )}
        <Button text={retryText} onClick={onRetry} variant={retryVariant} />
      </Box>
    </Box>
  );
};

export default ServerErrorBanner;
