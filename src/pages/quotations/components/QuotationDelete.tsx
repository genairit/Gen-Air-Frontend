import {
  BUTTON_SIZES,
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import { Box } from "@mui/material";
import Button from "./QuotationButton";
import { useState, type FC } from "react";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { TEXT_DIRECTIONS } from "../../../constants/direction.constant";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import ValidationMessageText from "../../../components/ValidationMessageText/ValidationMessageText";

interface IQuotationDeleteProps {
  number: string;
  blocked: boolean;
  pending: boolean;
  error: string | null;
  onDelete: () => Promise<void>;
  onReload: () => Promise<void>;
}
const QuotationDelete: FC<IQuotationDeleteProps> = ({
  error,
  number,
  blocked,
  pending,
  onDelete,
  onReload,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        ariaLabel="מחיקת ההצעה"
        icon={ICON_NAMES.DELETE}
        size={BUTTON_SIZES.COMPACT}
        shape={BUTTON_SHAPES.CIRCLE}
        disabled={blocked || pending}
        onClick={() => setOpen(true)}
        variant={BUTTON_VARIANTS.DANGER}
        sx={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
      />
      {open && (
        <GenericPopup
          open={open}
          title="מחיקת הצעה"
          closeDisabled={pending}
          closeAfterAction={false}
          dir={TEXT_DIRECTIONS.RTL}
          onClose={() => setOpen(false)}
          buttons={{
            primary: {
              text: pending ? "מוחק..." : "מחק הצעה",
              isDisabled: blocked || pending,
              onClick: onDelete,
            },
            secondary: { text: "חזרה", isDisabled: pending, onClick: () => setOpen(false) },
          }}
          content={
            <>
              <Box component="p">למחוק את {number}? אי אפשר לשחזר דרך האפליקציה.</Box>
              {error && (
                <Box role="alert">
                  <ValidationMessageText text={error} />
                  <Button text="טען גרסה עדכנית" onClick={onReload} disabled={pending} />
                </Box>
              )}
            </>
          }
        />
      )}
    </>
  );
};
export default QuotationDelete;
