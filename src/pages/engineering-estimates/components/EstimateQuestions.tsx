import { useState, type FC } from "react";
import { Box, Typography } from "@mui/material";
import EstimateSection from "./EstimateSection";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import TextField from "../../../components/TextField/TextField";
import { CommandIdentityManager } from "../../../managers/command-identity.manager";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { ESTIMATE_TYPOGRAPHY } from "../../../styles/engineering-estimate-typography.style";
import type { IEstimateQuestion } from "../../../interfaces/engineering-estimate.interface";

interface IEstimateQuestionsProps {
  busy: boolean;
  canEdit: boolean;
  questions: IEstimateQuestion[];
  onChange: (questions: IEstimateQuestion[]) => void;
}

const EstimateQuestions: FC<IEstimateQuestionsProps> = ({ busy, canEdit, questions, onChange }) => {
  const styles = usePageStyles();
  const [prompt, setPrompt] = useState("");
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const canAdd =
    canEdit &&
    !busy &&
    [prompt, first, second].every(value => value.trim() !== "") &&
    first.trim() !== second.trim();
  const answer = (id: string, value: string): void => {
    onChange(
      questions.map(question => (question.id === id ? { ...question, answer: value } : question)),
    );
  };
  const add = (): void => {
    if (!canAdd) {
      return;
    }

    onChange([
      ...questions,
      {
        id: CommandIdentityManager.create(),
        prompt: prompt.trim(),
        options: [first.trim(), second.trim()],
        answer: null,
      },
    ]);
  };

  return (
    <EstimateSection title="שאלות לבירור">
      {questions.length === 0 && <Typography>אין שאלות פתוחות.</Typography>}
      {questions.map((question): React.JSX.Element => (
        <Box key={question.id} sx={styles.stack({ gap: "8px" })}>
          <Typography component="h3" sx={ESTIMATE_TYPOGRAPHY.group}>
            {question.prompt}
          </Typography>
          <Typography role="status">{question.answer ?? "ממתינה לתשובה"}</Typography>
          {canEdit && (
            <Box sx={styles.row({})}>
              {question.options.map((option): React.JSX.Element => (
                <Button
                  key={option}
                  text={option}
                  disabled={busy}
                  onClick={(): void => answer(question.id, option)}
                  variant={
                    question.answer === option ? BUTTON_VARIANTS.PRIMARY : BUTTON_VARIANTS.SECONDARY
                  }
                />
              ))}
            </Box>
          )}
        </Box>
      ))}
      {canEdit && (
        <>
          <TextField
            value={prompt}
            disabled={busy}
            title="שאלה לבירור"
            onChange={setPrompt}
            type={FIELD_TYPES.TEXT}
          />
          <TextField
            value={first}
            disabled={busy}
            onChange={setFirst}
            title="תשובה אפשרית 1"
            type={FIELD_TYPES.TEXT}
          />
          <TextField
            value={second}
            disabled={busy}
            onChange={setSecond}
            title="תשובה אפשרית 2"
            type={FIELD_TYPES.TEXT}
          />
          <Button onClick={add} text="הוספת שאלה" disabled={!canAdd} />
        </>
      )}
    </EstimateSection>
  );
};

export default EstimateQuestions;
