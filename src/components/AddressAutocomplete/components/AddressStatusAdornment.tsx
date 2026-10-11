import {
  PROJECT_ADDRESS_COPY,
  ADDRESS_FIELD_STATUSES,
  type AddressFieldStatusType,
} from "../../../constants/project-address.constant";

import Icon from "../../Icon/Icon";
import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "../AddressAutocomplete.style";
import { theme } from "../../../constants/theme.constants";
import { ICON_NAMES } from "../../../constants/icon.constant";

interface IAddressStatusAdornmentProps {
  typingHint: string;
  isConfirming: boolean;
  status: AddressFieldStatusType;
}

const AddressStatusAdornment: FC<IAddressStatusAdornmentProps> = ({
  status,
  typingHint,
  isConfirming,
}) => {
  const styles = useStyles();

  const renderHint = (hint: string) => (
    <Box component="span" sx={styles.hint}>
      {hint}
    </Box>
  );

  const ADORNMENT_BY_STATUS: Record<AddressFieldStatusType, () => ReactNode> = {
    [ADDRESS_FIELD_STATUSES.IDLE]: () => null,
    [ADDRESS_FIELD_STATUSES.SUGGESTIONS]: () => null,
    [ADDRESS_FIELD_STATUSES.TYPING]: () => renderHint(typingHint),
    [ADDRESS_FIELD_STATUSES.VERIFIED]: () => (
      <Box component="span" sx={styles.verifiedBadge}>
        <Box aria-hidden component="span" sx={styles.verifiedMark}>
          ✓
        </Box>
        {PROJECT_ADDRESS_COPY.VERIFIED}
      </Box>
    ),
    [ADDRESS_FIELD_STATUSES.UNVERIFIED]: () => (
      <Box component="span" sx={styles.unverifiedBadge}>
        <Icon size={20} name={ICON_NAMES.URGENT} color={theme.palette.danger} />
        {PROJECT_ADDRESS_COPY.UNVERIFIED}
      </Box>
    ),
  };

  if (isConfirming) {
    return renderHint(PROJECT_ADDRESS_COPY.CONFIRMING);
  }

  return ADORNMENT_BY_STATUS[status]();
};

export default AddressStatusAdornment;
