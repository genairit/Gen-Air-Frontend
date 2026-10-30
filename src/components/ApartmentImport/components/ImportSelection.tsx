import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "../../Button/Button";
import DropZone from "../../DropZone/DropZone";
import { useStyles } from "../ApartmentImport.style";
import { BUTTON_VARIANTS } from "../../Button/constants/button.constants";
import { APARTMENT_IMPORT } from "../../../constants/apartment-import.constant";

interface IImportSelectionProps {
  buttonLabel: string;
  existingCount: number;
  onDownloadTemplate: () => Promise<void>;
  onFilesSelected: (files: File[]) => Promise<void>;
}

const ImportSelection: FC<IImportSelectionProps> = ({
  existingCount,
  buttonLabel,
  onFilesSelected,
  onDownloadTemplate,
}) => {
  const styles = useStyles();
  const hasExisting = existingCount > 0;
  return (
    <Box sx={styles.stack}>
      {hasExisting && (
        <Box sx={styles.panel}>
          <Box component="b">לבניין כבר יש {existingCount} דירות</Box>
          <Box sx={styles.muted}>
            הייבוא מוסיף דירות חדשות בלבד. דירה שמספרה כבר קיים בבניין תדולג ולא תשתנה.
          </Box>
        </Box>
      )}
      <DropZone
        multiple={false}
        buttonLabel={buttonLabel}
        title="גרור לכאן קובץ אקסל"
        onFilesSelected={onFilesSelected}
        accept={APARTMENT_IMPORT.EXTENSION}
        description="קובץ xlsx אחד, עד 5 MB. בחירת הקובץ תתחיל מיד את הייבוא."
      />
      <Box sx={styles.muted}>
        יש להשתמש בגיליון ״דירות״ ובכותרות התבנית הרשמית, ללא שינוי הסדר. אין שלב תצוגה מקדימה. מספר
        מזהה לקוח (ח״פ / ת״ז) נדרש בכל שורה. ללקוח חדש נדרשים גם סוג לקוח וכתובת לקוח, לצד שם, טלפון
        ודוא״ל תקינים.
      </Box>
      <Button
        text="הורד תבנית אקסל"
        onClick={onDownloadTemplate}
        variant={BUTTON_VARIANTS.SECONDARY}
      />
    </Box>
  );
};

export default ImportSelection;
