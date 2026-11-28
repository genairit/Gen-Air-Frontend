import type {
  IEstimateArea,
  IEstimatePreview,
} from "../../../interfaces/engineering-estimate.interface";

import { Box } from "@mui/material";
import { Fragment, type FC } from "react";
import styles from "../estimate-document.module.css";
import BrandLogo from "../../../components/BrandLogo/BrandLogo";
import { quotationMoney } from "../../../utilities/quotation.utility";

interface IEstimateDocumentProps {
  name: string;
  areas: IEstimateArea[];
  pricing: IEstimatePreview;
}

const EstimateDocument: FC<IEstimateDocumentProps> = ({ name, areas, pricing }) => {
  const missingPrice = pricing.lines.some(line => line.unitPrice === null);
  return (
    <Box
      dir="rtl"
      component="article"
      className={styles.sheet}
      aria-label="תצוגה מקדימה של כתב הכמויות"
    >
      <Box component="header" className={styles.documentHeader}>
        <Box component="div">
          <Box component="h2">כתב כמויות</Box>
          <Box component="p">{name || "כתב כמויות חדש"}</Box>
        </Box>
        <BrandLogo width="110px" />
      </Box>
      <Box component="div" className={styles.scroll}>
        <Box component="table" className={`${styles.table} ${styles.documentTable}`}>
          <Box component="thead">
            <Box component="tr">
              <Box scope="col" component="th">
                מק״ט
              </Box>
              <Box scope="col" component="th">
                תיאור
              </Box>
              <Box scope="col" component="th">
                כמות כוללת
              </Box>
              <Box scope="col" component="th">
                מחיר יחידה
              </Box>
              <Box scope="col" component="th">
                סה״כ
              </Box>
            </Box>
          </Box>
          <Box component="tbody">
            {areas.map(area => {
              const rows = pricing.lines.filter(line => line.areaId === area.id);
              return (
                <Fragment key={area.id}>
                  <Box component="tr" className={styles.area}>
                    <Box colSpan={5} component="th" scope="rowgroup">
                      {area.name} · {area.repeatCount} חזרות
                    </Box>
                  </Box>
                  {rows.map((line, index) => (
                    <Box component="tr" key={`${area.id}:${index}`}>
                      <Box component="td">
                        <Box component="bdi">{line.sku}</Box>
                      </Box>
                      <Box component="td">
                        {line.description}
                        {line.source === "rule" && <Box component="small"> · מחושב לפי כללים</Box>}
                      </Box>
                      <Box component="td" className={styles.number}>
                        <Box component="bdi">
                          {line.quantity} {line.unit}
                        </Box>
                      </Box>
                      <Box component="td" className={styles.number}>
                        {line.unitPrice === null ? "חסר מחיר" : quotationMoney(line.unitPrice)}
                      </Box>
                      <Box component="td" className={styles.number}>
                        {line.total === null ? "—" : quotationMoney(line.total)}
                      </Box>
                    </Box>
                  ))}
                </Fragment>
              );
            })}
          </Box>
        </Box>
      </Box>
      {pricing.lines.length === 0 && (
        <Box component="p">הוסיפו פריטים מהקטלוג להצגת כתב הכמויות.</Box>
      )}
      <Box component="div" className={styles.total}>
        <Box component="span">{missingPrice ? "סכום חלקי לפני מע״מ" : "סה״כ לפני מע״מ"}</Box>
        <Box component="bdi">{quotationMoney(pricing.subtotal)}</Box>
      </Box>
      {missingPrice && (
        <Box component="p" role="status">
          יש להשלים מחירי קטלוג לפריטים המסומנים.
        </Box>
      )}
    </Box>
  );
};
export default EstimateDocument;
