import Button from "./QuotationButton";
import { useState, type FC } from "react";
import styles from "../quotation.module.css";
import Card from "../../../components/Card/Card";
import { QUOTATION_DELETE_STYLES } from "./QuotationDelete.style";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

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
  const [confirming, setConfirming] = useState(false);
  const disabled = blocked || pending;
  const confirmationLabel = pending ? "מוחק..." : "מחק";
  return (
    <Card gap="10px" padding="16px 20px">
      {confirming ? (
        <>
          <span>למחוק את {number}? אי אפשר לשחזר דרך האפליקציה.</span>
          <div className={styles.row}>
            <Button
              onClick={onDelete}
              disabled={disabled}
              text={confirmationLabel}
              ariaLabel="אישור מחיקת ההצעה"
              variant={BUTTON_VARIANTS.DARK}
              sx={QUOTATION_DELETE_STYLES.confirmation}
            />
            <Button
              text="ביטול"
              disabled={pending}
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={() => setConfirming(false)}
              sx={QUOTATION_DELETE_STYLES.confirmation}
            />
          </div>
        </>
      ) : (
        <Button
          text="מחיקת ההצעה"
          disabled={disabled}
          variant={BUTTON_VARIANTS.NEUTRAL}
          sx={QUOTATION_DELETE_STYLES.action}
          onClick={() => setConfirming(true)}
        />
      )}
      {error && (
        <div role="alert" className={styles.error}>
          {error}
          <Button
            onClick={onReload}
            disabled={disabled}
            text="טעינת גרסה מעודכנת"
            variant={BUTTON_VARIANTS.NEUTRAL}
            sx={QUOTATION_DELETE_STYLES.confirmation}
          />
        </div>
      )}
    </Card>
  );
};
export default QuotationDelete;
