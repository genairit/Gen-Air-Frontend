import type { JSX } from "react";
import DeleteIcon from "../../../icons/DeleteIcon";
import WarningIcon from "../../../icons/WarningIcon";
import SuccessIcon from "../../../icons/SuccessIcon";
import ConfettiIcon from "../../../icons/ConfettiIcon";
import PersonalityIcon from "../../../icons/PersonalityIcon";

export type TPopUpIcons =
  | "SUCCESS"
  | "WARNING"
  | "DELETE"
  | "PERSONALITY"
  | "CONFETTI";

export const GENERIC_POPUP_ICONS: Record<TPopUpIcons, JSX.ElementType> =
  {
    DELETE: DeleteIcon,
    WARNING: WarningIcon,
    SUCCESS: SuccessIcon,
    CONFETTI: ConfettiIcon,
    PERSONALITY: PersonalityIcon,
  };
