import { useState } from "react";
import type { IStageMove } from "../interfaces/project.interface";
import { isWaitingForResponseStage } from "../utilities/stage-reason.utility";

interface IStageReasonGateOptions {
  onCancel: () => void;
  moveToStage: (stageId: string) => void;
  moveWithReason: (move: IStageMove) => Promise<void>;
}

export const useStageReasonGate = ({
  onCancel,
  moveToStage,
  moveWithReason,
}: IStageReasonGateOptions) => {
  const [pendingStageId, setPendingStageId] = useState<string | null>(null);

  const requestStage = (stageId: string) => {
    if (isWaitingForResponseStage(stageId)) {
      setPendingStageId(stageId);
      return;
    }

    moveToStage(stageId);
  };

  const confirmReason = async (note: string) => {
    if (!pendingStageId) {
      return;
    }

    await moveWithReason({ stageId: pendingStageId, note });
    setPendingStageId(null);
  };

  const cancelReason = () => {
    setPendingStageId(null);
    onCancel();
  };

  return { isReasonOpen: pendingStageId !== null, requestStage, confirmReason, cancelReason };
};
