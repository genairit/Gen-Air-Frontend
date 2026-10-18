import { useState } from "react";
import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import ShowcaseSection from "../ShowcaseSection";
import { useShowcaseStyles } from "../showcase.style";
import Button from "../../../components/Button/Button";
import { noop } from "../../../utilities/function.utility";
import TextField from "../../../components/TextField/TextField";
import DataTable from "../../../components/DataTable/DataTable";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { getOptionLabels } from "../../../utilities/option.utility";
import { formatVisibleCount } from "../../../utilities/text.utility";
import { DEMO_EMPLOYEES } from "../../../constants/demo-data.constant";
import { SHOWCASE_EMPLOYEE_COLUMNS } from "../columns/employee-columns";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { USER_ROLE_OPTIONS } from "../../../constants/user-role.constant";
import { getEmployeeId, isEmployeeDisabled } from "../../../utilities/employee.utility";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

const TableSection = () => {
  const styles = useShowcaseStyles();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string | null>(USER_ROLE_OPTIONS[0].label);

  return (
    <ShowcaseSection position={10} title="טבלת נתונים — עובדים">
      <Card gap="18px">
        <CardHeader
          title="הוספת עובד / משתמש חדש"
          subtitle="יצירת חשבון, שיוך תפקיד וקביעת סיסמה זמנית"
        />
        <Box sx={[styles.grid({ minColumnWidth: 180, gap: "14px" }), styles.bottomAligned]}>
          <TextField
            isRequired
            title="שם מלא"
            value={fullName}
            onChange={setFullName}
            type={FIELD_TYPES.NAME}
            placeholder="לדוגמה: יובל אל"
          />
          <TextField
            isRequired
            value={email}
            title="כתובת דוא״ל"
            onChange={setEmail}
            type={FIELD_TYPES.EMAIL}
            placeholder="yuval@genair.co.il"
          />
          <Autocomplete
            isRequired
            value={role}
            onChange={setRole}
            title="תפקיד והרשאה"
            isAutocomplete={false}
            options={getOptionLabels(USER_ROLE_OPTIONS)}
          />
          <Button onClick={noop} text="הוסף עובד למערכת" />
        </Box>
      </Card>

      <DataTable
        rows={DEMO_EMPLOYEES}
        getRowId={getEmployeeId}
        isRowDimmed={isEmployeeDisabled}
        columns={SHOWCASE_EMPLOYEE_COLUMNS}
        footer={
          <Box component="span" sx={styles.caption}>
            {formatVisibleCount({ visible: DEMO_EMPLOYEES.length, total: DEMO_EMPLOYEES.length })}
          </Box>
        }
      />
    </ShowcaseSection>
  );
};

export default TableSection;
