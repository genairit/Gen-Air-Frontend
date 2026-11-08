import type { FC } from "react";
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
      <div className={styles.cardTitle}>
        <span aria-hidden="true" className={styles.cardIcon}>
          <Icon name={ICON_NAMES.PROGRESS} />
        </span>
        <div>
          <h2>מעגלים ודיאגנוסטיקה</h2>
          <p className={styles.muted}>
            סה״כ BTU פנים מול מעבה · ההתראות המחייבות מופיעות בבדיקה ואישור
          </p>
        </div>
      </div>
      <div className={styles.row}>
        {circuits.map(circuit => (
          <div key={circuit.id} className={styles.circuit}>
            <b>
              מעגל {circuit.key} · יחס {circuit.ratio ?? "—"}
            </b>
            <span>
              פנים{" "}
              <span dir="ltr" className={styles.btuPair}>
                {circuit.indoor} BTU
              </span>
            </span>
            <span>
              מעבה{" "}
              <span dir="ltr" className={styles.btuPair}>
                {circuit.outdoor} BTU
              </span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
export default QuotationDiagnostics;
