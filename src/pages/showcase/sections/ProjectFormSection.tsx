import {
  DEMO_INITIAL_ASSIGNEES,
  DEMO_PROJECT_TYPE_OPTIONS,
  DEMO_PROJECT_ROLE_ASSIGNMENTS,
} from "../../../constants/demo-data.constant";

import { useState } from "react";
import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import ShowcaseSection from "../ShowcaseSection";
import { useShowcaseStyles } from "../showcase.style";
import Button from "../../../components/Button/Button";
import { noop } from "../../../utilities/function.utility";
import { CHIP_SIZES } from "../../../constants/chip.constant";
import ActionBar from "../../../components/ActionBar/ActionBar";
import CardHeader from "../../../components/CardHeader/CardHeader";
import OptionCard from "../../../components/OptionCard/OptionCard";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import PersonSummary from "../../../components/PersonSummary/PersonSummary";
import { SURFACE_DEPTHS, SURFACE_RADII } from "../../../constants/surface.constant";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

const ProjectFormSection = () => {
  const styles = useShowcaseStyles();
  const [selectedTypeId, setSelectedTypeId] = useState(DEMO_PROJECT_TYPE_OPTIONS[0].id);
  const [assignees, setAssignees] = useState<Record<string, string | null>>(DEMO_INITIAL_ASSIGNEES);

  const handleAssigneeChange = (roleId: string, assignee: string | null) =>
    setAssignees(current => ({ ...current, [roleId]: assignee }));

  return (
    <ShowcaseSection position={8} title="יצירה ועריכת פרויקט">
      <Card gap="22px" padding="28px">
        <CardHeader
          title="בחירת סוג פרויקט"
          subtitle="הסיווג קובע את מפרט הציוד"
          action={
            <Box href="#" component="a" sx={styles.link}>
              בחר סוג תכנון
            </Box>
          }
        />
        <Box sx={styles.grid({ minColumnWidth: 190, gap: "20px" })}>
          {DEMO_PROJECT_TYPE_OPTIONS.map(option => (
            <OptionCard
              key={option.id}
              tag={option.tag}
              title={option.title}
              subtitle={option.subtitle}
              description={option.description}
              isSelected={option.id === selectedTypeId}
              onSelect={() => setSelectedTypeId(option.id)}
            />
          ))}
        </Box>
      </Card>

      <Card gap="22px" padding="28px">
        <CardHeader
          title="הקצאת תפקידים וצוות"
          subtitle="הגדרת בעלי תפקידים עם הרשאות לוח בקרה"
          action={<Chip size={CHIP_SIZES.MEDIUM} label="4 תפקידים מוגדרים" />}
        />
        <Box sx={styles.grid({ minColumnWidth: 220, gap: "20px" })}>
          {DEMO_PROJECT_ROLE_ASSIGNMENTS.map(assignment => (
            <Card
              padding="18px"
              key={assignment.id}
              radius={SURFACE_RADII.PANEL}
              depth={SURFACE_DEPTHS.RAISED_SOFT}
            >
              <PersonSummary nameSize={15} avatarSize={40} person={assignment.role} />
              <Box component="span" sx={styles.label}>
                איש צוות מוקצה
              </Box>
              <Autocomplete
                isAutocomplete={false}
                options={assignment.options}
                value={assignees[assignment.id]}
                onChange={assignee => handleAssigneeChange(assignment.id, assignee)}
              />
            </Card>
          ))}
        </Box>
      </Card>

      <ActionBar caption="כל השינויים ישלחו התראות מיידיות ב-Slack ובאימייל לאנשי הצוות המוקצים.">
        <Button onClick={noop} text="מחק פרויקט" variant={BUTTON_VARIANTS.DANGER} />
        <Button text="ביטול" onClick={noop} variant={BUTTON_VARIANTS.NEUTRAL} />
        <Button onClick={noop} text="צור פרויקט" />
      </ActionBar>
    </ShowcaseSection>
  );
};

export default ProjectFormSection;
