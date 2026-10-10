import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX } from "../../styles/templates.style";
import type { AvatarToneType } from "../../constants/tone.constant";
import { getInitialsFontSize } from "../../utilities/avatar.utility";

const { palette, radius } = theme;

const COLORS_BY_TONE: Record<AvatarToneType, { color: string; backgroundColor: string }> = {
  air: { color: palette.charcoal, backgroundColor: palette.airBlue },
  charcoal: { color: palette.iceWhite, backgroundColor: palette.charcoal },
};

interface IAvatarStyleOptions {
  size: number;
  hasRing: boolean;
  tone: AvatarToneType;
}

export const useStyles = () =>
  createStyles({
    avatar: ({ size, tone, hasRing }: IAvatarStyleOptions) => ({
      ...CENTERED_FLEX,
      width: size,
      height: size,
      flexShrink: 0,
      fontWeight: 700,
      borderRadius: radius.pill,
      fontSize: getInitialsFontSize(size),
      border: hasRing ? `2px solid ${palette.iceWhite}` : "none",
      ...COLORS_BY_TONE[tone],
    }),
  });
