import { theme } from "../../../theme";
import InfoIcon from "../../../icons/Info";
import ErrorIcon from "../../../icons/Error";
import type { CSSProperties, FC } from "react";
import SuccessIcon from "../../../icons/Success";
import WarningIcon from "../../../icons/Warning";
import type { SvgIconProps } from "@mui/material";
import type { INoticeToneOptions } from "../utilities/notice-palette.utility";

export const NOTICE_VARIANTS = {
  text: "text",
  info: "info",
  error: "error",
  warning: "warning",
  success: "success",
} as const;

export const NOTICE_SIZES = {
  regular: "regular",
  compact: "compact",
} as const;

export type TNoticeSize = keyof typeof NOTICE_SIZES;
export type TNoticeVariant = keyof typeof NOTICE_VARIANTS;

export const NOTICE_PALETTE_WEIGHTS = {
  DEEP_TONE: 0.72,
  LIGHT_TONE: 0.6,
  BORDER_OPACITY: 0.4,
  BACKGROUND_TONE: 0.07,
} as const;

interface INoticeVariantStyle extends INoticeToneOptions {
  DefaultIcon: FC<SvgIconProps> | null;
}

export const STYLE_BY_VARIANT: Record<TNoticeVariant, INoticeVariantStyle> = {
  text: {
    DefaultIcon: null,
    tone: theme.status.info,
    inkWeight: NOTICE_PALETTE_WEIGHTS.DEEP_TONE,
  },
  info: {
    DefaultIcon: InfoIcon,
    tone: theme.status.info,
    inkWeight: NOTICE_PALETTE_WEIGHTS.DEEP_TONE,
  },
  error: {
    DefaultIcon: ErrorIcon,
    tone: theme.status.error,
    inkWeight: NOTICE_PALETTE_WEIGHTS.DEEP_TONE,
  },
  warning: {
    DefaultIcon: WarningIcon,
    tone: theme.status.warning,
    inkWeight: NOTICE_PALETTE_WEIGHTS.LIGHT_TONE,
  },
  success: {
    DefaultIcon: SuccessIcon,
    tone: theme.status.success,
    inkWeight: NOTICE_PALETTE_WEIGHTS.LIGHT_TONE,
  },
};

export const STYLE_BY_SIZE: Record<TNoticeSize, CSSProperties> = {
  regular: { padding: "18px 20px", gap: "14px" },
  compact: { padding: "12px 14px", gap: "10px" },
};
