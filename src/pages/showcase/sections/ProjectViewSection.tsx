import {
  DEMO_PROJECT_TEAM,
  DEMO_PROJECT_FILES,
  DEMO_PROJECT_FOLDERS,
  DEMO_PROJECT_TIMELINE,
} from "../../../constants/demo-data.constant";

import { useState } from "react";
import { Box } from "@mui/material";
import Dot from "../../../components/Dot/Dot";
import Card from "../../../components/Card/Card";
import ShowcaseSection from "../ShowcaseSection";
import { useShowcaseStyles } from "../showcase.style";
import Button from "../../../components/Button/Button";
import FileRow from "../../../components/FileRow/FileRow";
import { theme } from "../../../constants/theme.constants";
import { noop } from "../../../utilities/function.utility";
import DropZone from "../../../components/DropZone/DropZone";
import Timeline from "../../../components/Timeline/Timeline";
import TextField from "../../../components/TextField/TextField";
import { validateFreeText } from "../../../utilities/validators";
import { formatFileCount } from "../../../utilities/text.utility";
import CardHeader from "../../../components/CardHeader/CardHeader";
import PersonCard from "../../../components/PersonCard/PersonCard";
import { toggleSelectedId } from "../../../utilities/selection.utility";
import ProjectHeader from "../../../components/ProjectHeader/ProjectHeader";
import FolderAccordion from "../../../components/FolderAccordion/FolderAccordion";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

const ProjectViewSection = () => {
  const styles = useShowcaseStyles();
  const [logEntry, setLogEntry] = useState("");
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);

  const handleFolderToggle = (folderId: string) =>
    setExpandedFolderId(currentId => toggleSelectedId(currentId, folderId));

  return (
    <ShowcaseSection position={7} title="תצוגת פרויקט">
      <ProjectHeader
        projectId="GA-84920"
        title="מגדל פארק בבלי C"
        stage="שלב ביצוע: צנרת ותשתיות VRF"
        syncCaption="סונכרן מול Priority ERP · 16:45, 20/12/2023"
        actions={
          <>
            <Button text="עריכה" onClick={noop} variant={BUTTON_VARIANTS.NEUTRAL} />
            <Button onClick={noop} text="העלאת מסמך" />
          </>
        }
      />

      <Card gap="20px" padding="28px">
        <CardHeader
          badge="4 חברי צוות"
          title="צוות הפרויקט המוקצה"
          subtitle="חלוקת תפקידים וניהול צוות תפעולי בשטח"
          action={
            <Box component="span" sx={[styles.caption, styles.row({ gap: "8px" })]}>
              <Dot color={theme.palette.statusBlue} />
              צוות פעיל בשטח
            </Box>
          }
        />
        <Box sx={styles.grid({ minColumnWidth: 200, gap: "18px" })}>
          {DEMO_PROJECT_TEAM.map(person => (
            <PersonCard person={person} key={person.name} />
          ))}
        </Box>
      </Card>

      <Box sx={styles.grid({ minColumnWidth: 360 })}>
        <Box sx={styles.stack({ gap: "24px" })}>
          <Card>
            <CardHeader
              title="מבנה תיקיות ומסמכי פרויקט"
              subtitle="לחיצה על שם הקובץ פותחת אותו ב-Google Drive"
            />
            {DEMO_PROJECT_FOLDERS.map(folder => (
              <FolderAccordion
                key={folder.id}
                title={folder.name}
                caption={formatFileCount(folder.fileCount)}
                isExpanded={folder.id === expandedFolderId}
                onToggle={() => handleFolderToggle(folder.id)}
              >
                {DEMO_PROJECT_FILES.map(file => (
                  <FileRow file={file} key={file.id} linkLabel="פתח ב-Drive" />
                ))}
              </FolderAccordion>
            ))}
          </Card>
          <DropZone
            onFilesSelected={noop}
            buttonLabel="בחר קבצים מהמחשב"
            title="גרור ושחרר קבצים לכאן להעלאה"
            description="סנכרון אוטומטי לתיקיית Google Drive של הפרויקט (GA-84920) · עד 250MB"
          />
        </Box>

        <Card gap="20px">
          <CardHeader
            badge="3 עדכונים"
            title="ציר זמן והיסטוריית סטטוס"
            action={
              <Box component="span" sx={styles.caption}>
                מסונכרן
              </Box>
            }
          />
          <Timeline entries={DEMO_PROJECT_TIMELINE} />
          <Box sx={styles.stack({ gap: "12px" })}>
            <Box component="b" sx={styles.strong({ fontSize: 15 })}>
              יומן טכנאי — הוספת רשומה
            </Box>
            <TextField
              multiline
              minRows={4}
              value={logEntry}
              onChange={setLogEntry}
              type={FIELD_TYPES.TEXT}
              validator={validateFreeText}
              placeholder="תיאור העבודה שבוצעה היום, ממצאים וחריגות..."
            />
            <Button
              onClick={noop}
              text="שמור ביומן"
              sx={styles.alignStart}
              variant={BUTTON_VARIANTS.SECONDARY}
            />
          </Box>
        </Card>
      </Box>
    </ShowcaseSection>
  );
};

export default ProjectViewSection;
