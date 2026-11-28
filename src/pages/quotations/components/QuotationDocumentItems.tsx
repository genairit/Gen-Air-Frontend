import {
  quotationFloorGroups,
  quotationSectionHeading,
} from "../../../utilities/quotation-floor.utility";

import { Box } from "@mui/material";
import { Fragment, type FC } from "react";
import styles from "../quotation-document.module.css";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { QUOTATION_ROW_COPY } from "../../../constants/quotation.constant";
import { quotationLineAmount } from "../../../utilities/quotation-document.utility";
import { quotationDecimalInput } from "../../../utilities/quotation-presentation.utility";

const QuotationDocumentItems: FC<{ quotation: IQuotation }> = ({ quotation }) => (
  <Box component="table" className={styles.lines} aria-label="פריטים במסמך">
    <Box component="thead">
      <Box component="tr">
        <Box scope="col" component="th">
          מק״ט
        </Box>
        <Box scope="col" component="th">
          תיאור מוצר
        </Box>
        <Box scope="col" component="th">
          BTU
        </Box>
        <Box scope="col" component="th">
          כמות
        </Box>
        <Box scope="col" component="th">
          מחיר ליחידה
        </Box>
        <Box scope="col" component="th">
          סה״כ מחיר
        </Box>
      </Box>
    </Box>
    {quotationFloorGroups(quotation).map(floor => (
      <Box component="tbody" key={floor.floorId ?? floor.companies[0]?.brand ?? "general"}>
        {floor.floorName && (
          <Box component="tr" className={styles.floor}>
            <Box colSpan={6} component="th" scope="rowgroup">
              {floor.floorName}
            </Box>
          </Box>
        )}
        {floor.companies.map(company => (
          <Fragment key={company.brand ?? "general"}>
            <Box component="tr" className={styles.company}>
              <Box colSpan={6} component="th">
                {company.brand ?? QUOTATION_ROW_COPY.GENERAL}
              </Box>
            </Box>
            {company.sections.map(section => (
              <Fragment key={section.id}>
                {quotationSectionHeading(section) && (
                  <Box component="tr" className={styles.system}>
                    <Box colSpan={6} component="th">
                      {quotationSectionHeading(section)}
                    </Box>
                  </Box>
                )}
                {section.items.map(line => (
                  <Box key={line.id} component="tr">
                    <Box component="td">
                      <Box component="bdi">{line.sku}</Box>
                    </Box>
                    <Box component="td">{line.description}</Box>
                    <Box component="td">
                      <Box component="bdi">
                        {line.capacityBtu != null &&
                          `${line.capacityBtu.toLocaleString("en-US")} BTU`}
                      </Box>
                    </Box>
                    <Box component="td">
                      <Box component="bdi">
                        {quotationDecimalInput(line.quantity)} {line.unit}
                      </Box>
                    </Box>
                    <Box component="td">
                      <Box component="bdi">{line.quotedPrice} ₪</Box>
                    </Box>
                    <Box component="td">
                      <Box component="bdi">{quotationLineAmount(line)} ₪</Box>
                    </Box>
                  </Box>
                ))}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </Box>
    ))}
  </Box>
);
export default QuotationDocumentItems;
