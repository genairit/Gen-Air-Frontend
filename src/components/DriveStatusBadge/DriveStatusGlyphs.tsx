import { theme } from "../../constants/theme.constants";
import { DRIVE_STATUS_SPINNER_ROTATION_MS } from "../../constants/drive-folder.constant";

const { palette } = theme;

export const HasContentGlyph = () => (
  <>
    <circle r="10" cx="10" cy="10" fill={palette.primary} />
    <path
      fill="none"
      strokeWidth="2.2"
      strokeLinecap="round"
      stroke={palette.white}
      strokeLinejoin="round"
      d="M5.5 10.4l3 3 6-6.6"
    />
  </>
);

export const EmptyGlyph = () => (
  <>
    <circle r="10" cx="10" cy="10" fill={palette.charcoal} />
    <path
      fill="none"
      strokeWidth="2.2"
      strokeLinecap="round"
      stroke={palette.white}
      d="M6.6 6.6l6.8 6.8M13.4 6.6l-6.8 6.8"
    />
  </>
);

export const LoadingGlyph = () => (
  <>
    <circle r="8" cx="10" cy="10" fill="none" strokeWidth="2.4" stroke={palette.spinnerTrack} />
    <path
      fill="none"
      strokeWidth="2.4"
      strokeLinecap="round"
      d="M10 2a8 8 0 0 1 8 8"
      stroke={palette.primary}
    >
      <animateTransform
        type="rotate"
        to="360 10 10"
        from="0 10 10"
        repeatCount="indefinite"
        attributeName="transform"
        dur={`${DRIVE_STATUS_SPINNER_ROTATION_MS}ms`}
      />
    </path>
  </>
);

export const UnknownGlyph = () => (
  <>
    <circle
      r="9"
      cx="10"
      cy="10"
      strokeWidth="1.6"
      fill={palette.iceWhite}
      strokeDasharray="3 2.4"
      stroke={palette.textMuted}
    />
    <path
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      stroke={palette.textMuted}
      d="M7.7 7.9a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.1.8-1.1 1.6"
    />
    <circle r="1.1" cx="10" cy="14.4" fill={palette.textMuted} />
  </>
);
