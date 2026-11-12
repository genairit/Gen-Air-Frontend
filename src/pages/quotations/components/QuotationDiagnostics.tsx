import type { FC } from "react";
import { Box } from "@mui/material";
import styles from "../quotation.module.css";
import Icon from "../../../components/Icon/Icon";
import Card from "../../../components/Card/Card";
import { ICON_NAMES } from "../../../constants/icon.constant";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { quotationCircuits } from "../../../utilities/quotation-presentation.utility";

interface IQuotationDiagnosticsProps {
  quotation: IQuotation;
}
const QuotationDiagnostics: FC<IQuotationDiagnosticsProps> = ({ quotation }) => {
  const circuits = quotationCircuits(quotation);
  if (!circuits.length) {
    return null;
  }
  return (
    <Card>
      <Box component="div" className={styles.cardTitle}>
        <Box component="span" aria-hidden="true" className={styles.cardIcon}>
          <Icon name={ICON_NAMES.PROGRESS} />
        </Box>
        <Box component="div">
          <Box component="h2">מעגלים ודיאגנוסטיקה</Box>
          <Box component="p" className={styles.muted}>
            סה״כ BTU פנים מול מעבה · ההתראות המחייבות מופיעות בבדיקה ואישור
          </Box>
        </Box>
      </Box>
      <Box component="div" className={styles.row}>
        {circuits.map(circuit => (
          <Box component="div" key={circuit.id} className={styles.circuit}>
            <Box component="b">
              מעגל {circuit.key} · יחס {circuit.ratio ?? "—"}
            </Box>
            <Box component="span">
              פנים{" "}
              <Box dir="ltr" component="span" className={styles.btuPair}>
                {circuit.indoor} BTU
              </Box>
            </Box>
            <Box component="span">
              מעבה{" "}
              <Box dir="ltr" component="span" className={styles.btuPair}>
                {circuit.outdoor} BTU
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
};
export default QuotationDiagnostics;
