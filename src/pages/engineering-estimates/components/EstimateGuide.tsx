import {
  useEstimateCommand,
  getEstimateCommandErrorMessage,
} from "../../../hooks/engineering-estimate.hook";

import {
  ESTIMATE_SETUP,
  ESTIMATE_SETUP_PROMPTS,
} from "../../../constants/engineering-estimate.constant";

import type {
  TEstimatePatch,
  EstimateSetupType,
  IEngineeringEstimate,
} from "../../../interfaces/engineering-estimate.interface";

import EstimatePlans from "./EstimatePlans";
import { Box, Typography } from "@mui/material";
import { usePageStyles } from "../../page.style";
import EstimateAreaEditor from "./EstimateAreaEditor";
import EstimateScopeField from "./EstimateScopeField";
import Button from "../../../components/Button/Button";
import EstimateProjectPicker from "./EstimateProjectPicker";
import { JENNY_ROLES } from "../../../constants/jenny.constant";
import InlineError from "../../../components/InlineError/InlineError";
import { focusConnectedElement } from "../../../utilities/focus.utility";
import { useEffect, type FC, type ReactNode, type RefObject } from "react";
import JennyHeader from "../../../components/Jenny/components/JennyHeader";
import { useThreadStyles } from "../../../components/Jenny/JennyThread.style";
import { engineeringEstimateService } from "../../../services/engineering-estimate.service";

interface IEstimateGuideProps {
  titleId: string;
  canBrowse: boolean;
  onClose: () => void;
  isFullScreen: boolean;
  estimate: IEngineeringEstimate;
  inputRef: RefObject<HTMLElement | null>;
}

const EstimateGuide: FC<IEstimateGuideProps> = ({
  estimate,
  titleId,
  isFullScreen,
  onClose,
  canBrowse,
  inputRef,
}) => {
  const styles = usePageStyles();
  const threadStyles = useThreadStyles();
  const command = useEstimateCommand(estimate.id);
  const run = command.mutate;
  const busy = command.isPending;
  const step = estimate.setupStep;
  useEffect((): void => {
    focusConnectedElement(inputRef.current);
  }, [inputRef, step]);

  const move = (setupStep: EstimateSetupType): void => patch({ setupStep });
  const patch = (input: Omit<TEstimatePatch, "version">): void => {
    run(async (): Promise<void> => {
      await engineeringEstimateService.patch(estimate.id, { version: estimate.version, ...input });
    });
  };
  const finishBlocked = busy || estimate.areas.length === 0;
  const nextByStep: Record<EstimateSetupType, ReactNode> = {
    [ESTIMATE_SETUP.PROJECT]: (
      <>
        <EstimateProjectPicker
          disabled={busy}
          value={estimate.projectId}
          onChange={(projectId): void => patch({ projectId, setupStep: ESTIMATE_SETUP.PLANS })}
        />
        <Button
          disabled={busy}
          onClick={(): void => move(ESTIMATE_SETUP.PLANS)}
          text={estimate.projectId ? "המשך לתוכניות" : "המשך ללא פרויקט"}
        />
      </>
    ),
    [ESTIMATE_SETUP.PLANS]: (
      <>
        <EstimatePlans canEdit run={run} busy={busy} estimate={estimate} canBrowse={canBrowse} />
        <Button
          disabled={busy}
          text="המשך להיקף העבודה"
          onClick={(): void => move(ESTIMATE_SETUP.SCOPE)}
        />
      </>
    ),
    [ESTIMATE_SETUP.SCOPE]: (
      <>
        <EstimateScopeField
          busy={busy}
          value={estimate.scope}
          onChange={(scope): void => patch({ scope })}
        />
        <Button
          disabled={busy}
          text="המשך להגדרת אזורים"
          onClick={(): void => move(ESTIMATE_SETUP.AREAS)}
        />
      </>
    ),
    [ESTIMATE_SETUP.AREAS]: (
      <>
        <EstimateAreaEditor
          busy={busy}
          areas={estimate.areas}
          key={estimate.areas.length}
          onChange={(areas): void => patch({ areas })}
        />
        <Button
          text="סיום ההגדרה"
          disabled={finishBlocked}
          onClick={(): void => move(ESTIMATE_SETUP.COMPLETE)}
        />
      </>
    ),
    [ESTIMATE_SETUP.COMPLETE]: <Button onClick={onClose} text="עריכת כמויות ותמחור" />,
  };

  return (
    <>
      <JennyHeader
        titleId={titleId}
        onClose={onClose}
        hasMessages={false}
        onNewChat={onClose}
        canStartNewChat={false}
        isFullScreen={isFullScreen}
        contextLabel={estimate.name}
        subtitlePrefix="הגדרת טיוטה · "
      />
      <Box sx={threadStyles.thread}>
        <Box sx={styles.stack({ gap: "12px" })}>
          <Typography
            tabIndex={-1}
            role="status"
            ref={inputRef}
            sx={threadStyles.bubble(JENNY_ROLES.ASSISTANT)}
          >
            {ESTIMATE_SETUP_PROMPTS[estimate.setupStep]}
          </Typography>
          {nextByStep[estimate.setupStep]}
          {busy && <Typography role="status">שומרת את ההתקדמות…</Typography>}
          {command.isError && (
            <InlineError message={getEstimateCommandErrorMessage(command.error)} />
          )}
        </Box>
      </Box>
    </>
  );
};

export default EstimateGuide;
