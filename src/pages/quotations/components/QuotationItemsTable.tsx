import {
  addQuotationBrand,
  moveQuotationSection,
  updateQuotationSection,
  removeEmptyQuotationBrand,
} from "../../../utilities/quotation.utility";

import {
  moveQuotationFloor,
  quotationFloorGroups,
  renameQuotationFloor,
  withoutQuotationSection,
} from "../../../utilities/quotation-floor.utility";

import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import { Box } from "@mui/material";
import Button from "./QuotationButton";
import QuotationSelect from "./QuotationSelect";
import QuotationSection from "./QuotationSection";
import styles from "../quotation-items.module.css";
import { Fragment, useState, type FC } from "react";
import QuotationSystemForm from "./QuotationSystemForm";
import QuotationFloorHeading from "./QuotationFloorHeading";
import { QUOTATION_BRANDS } from "../../../constants/quotation.constant";
import type { IQuotation } from "../../../interfaces/quotation.interface";

interface IQuotationItemsTableProps {
  disabled: boolean;
  readOnly?: boolean;
  quotation: IQuotation;
  onChange: (next: IQuotation) => void;
}
const QuotationItemsTable: FC<IQuotationItemsTableProps> = ({
  quotation,
  disabled,
  readOnly = false,
  onChange,
}) => {
  const [openForm, setOpenForm] = useState<"system" | "brands" | null>(null);
  const [newSection, setNewSection] = useState<string | null>(null);
  const groups = quotationFloorGroups(quotation);
  const namedFloors = groups.filter(group => !!group.floorId);
  const unusedBrands = quotation.brands.filter(
    brand => !quotation.sections.some(section => section.brand === brand),
  );
  return (
    <Box component="section" aria-label="מערכות ושורות" className={styles.workspace}>
      <Box component="header" className={styles.toolbar}>
        <Box component="h2">מערכות ושורות</Box>
        {!readOnly && (
          <Box className={styles.actions}>
            <Box
              type="button"
              component="button"
              disabled={disabled}
              className={styles.textButton}
              aria-expanded={openForm === "brands"}
              onClick={() => setOpenForm(openForm === "brands" ? null : "brands")}
            >
              חברות
            </Box>
            <Button
              disabled={disabled}
              text="+ הוספת מערכת"
              size={BUTTON_SIZES.COMPACT}
              variant={BUTTON_VARIANTS.SECONDARY}
              ariaExpanded={openForm === "system"}
              onClick={() => setOpenForm(openForm === "system" ? null : "system")}
            />
          </Box>
        )}
      </Box>
      {!readOnly && openForm === "system" && (
        <QuotationSystemForm
          disabled={disabled}
          quotation={quotation}
          onClose={() => setOpenForm(null)}
          onSave={(next, id) => {
            setNewSection(id);
            onChange(next);
            setOpenForm(null);
          }}
        />
      )}
      {!readOnly && openForm === "brands" && (
        <Box className={styles.form}>
          <QuotationSelect
            value=""
            label="הוספת חברה"
            disabled={disabled}
            onChange={event => onChange(addQuotationBrand(quotation, event.target.value))}
            items={[
              { value: "", label: "בחרו חברה להוספה" },
              ...QUOTATION_BRANDS.filter(brand => !quotation.brands.includes(brand)).map(value => ({
                value,
                label: value,
              })),
            ]}
          />
          {unusedBrands.length > 0 && (
            <Box className={styles.actions}>
              {unusedBrands.map(brand => (
                <Button
                  key={brand}
                  disabled={disabled}
                  text={`הסרת ${brand}`}
                  size={BUTTON_SIZES.COMPACT}
                  variant={BUTTON_VARIANTS.NEUTRAL}
                  onClick={() => onChange(removeEmptyQuotationBrand(quotation, brand))}
                />
              ))}
            </Box>
          )}
        </Box>
      )}
      <Box className={styles.scroller}>
        <Box component="table" className={styles.table} aria-label="פריטי ההצעה">
          <Box component="colgroup">
            <Box component="col" className={styles.descriptionCol} />
            <Box component="col" className={styles.quantityCol} />
            <Box component="col" className={styles.priceCol} />
            <Box component="col" className={styles.totalCol} />
          </Box>
          <Box component="thead">
            <Box component="tr">
              <Box scope="col" component="th">
                פריט
              </Box>
              <Box scope="col" component="th">
                כמות
              </Box>
              <Box scope="col" component="th">
                מחיר יח׳
              </Box>
              <Box scope="col" component="th">
                סה״כ
              </Box>
            </Box>
          </Box>
          {!groups.length && (
            <Box component="tbody">
              <Box component="tr">
                <Box colSpan={4} component="td" className={styles.empty}>
                  אין פריטים בהצעה
                </Box>
              </Box>
            </Box>
          )}
          {groups.map(group => (
            <Box
              component="tbody"
              key={group.floorId ?? (group.companies[0].brand === null ? "general" : "unassigned")}
            >
              {group.floorId && group.floorName && (
                <QuotationFloorHeading
                  disabled={disabled}
                  readOnly={readOnly}
                  first={group.floorId === namedFloors[0]?.floorId}
                  last={group.floorId === namedFloors.at(-1)?.floorId}
                  floor={{ floorId: group.floorId, floorName: group.floorName }}
                  onRename={floor => onChange(renameQuotationFloor(quotation, floor))}
                  onMove={direction => {
                    if (group.floorId) {
                      onChange(moveQuotationFloor(quotation, group.floorId, direction));
                    }
                  }}
                />
              )}
              {group.companies.map(company => (
                <Fragment key={company.brand ?? "general"}>
                  <Box component="tr" className={styles.company}>
                    <Box scope="row" colSpan={4} component="th">
                      {company.brand ?? "כללי"}
                    </Box>
                  </Box>
                  {company.sections.map((section, position) => (
                    <QuotationSection
                      key={section.id}
                      section={section}
                      onEdit={onChange}
                      readOnly={readOnly}
                      disabled={disabled}
                      quotation={quotation}
                      first={position === 0}
                      newSection={newSection === section.id}
                      last={position === company.sections.length - 1}
                      onChange={next => onChange(updateQuotationSection(quotation, next))}
                      onRemove={() =>
                        onChange({
                          ...quotation,
                          sections: withoutQuotationSection(quotation, section.id),
                        })
                      }
                      onMove={direction =>
                        onChange(
                          moveQuotationSection(
                            quotation,
                            quotation.sections.indexOf(section),
                            direction,
                          ),
                        )
                      }
                    />
                  ))}
                </Fragment>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
export default QuotationItemsTable;
