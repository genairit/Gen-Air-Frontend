import {
  PROJECT_ADDRESS_COPY,
  ADDRESS_FIELD_STATUSES,
  type AddressFieldStatusType,
} from "../../../constants/project-address.constant";

import { Box } from "@mui/material";
import Button from "../../Button/Button";
import type { FC, ReactNode } from "react";
import { useStyles } from "../AddressAutocomplete.style";
import { BUTTON_SIZES, BUTTON_VARIANTS } from "../../Button/constants/button.constants";

interface IAddressStatusPanelProps {
  onRetry: () => void;
  failureTitle: string;
  onChange: () => void;
  cityLine: string | null;
  formattedAddress: string;
  status: AddressFieldStatusType;
}

const AddressStatusPanel: FC<IAddressStatusPanelProps> = ({
  status,
  onRetry,
  cityLine,
  onChange,
  failureTitle,
  formattedAddress,
}) => {
  const styles = useStyles();

  const PANEL_BY_STATUS: Record<AddressFieldStatusType, () => ReactNode> = {
    [ADDRESS_FIELD_STATUSES.IDLE]: () => null,
    [ADDRESS_FIELD_STATUSES.TYPING]: () => null,
    [ADDRESS_FIELD_STATUSES.SUGGESTIONS]: () => null,
    [ADDRESS_FIELD_STATUSES.VERIFIED]: () => (
      <Box role="status" sx={styles.verifiedPanel}>
        <Box sx={styles.panelText}>
          <Box component="b" sx={styles.panelTitle(false)}>
            {PROJECT_ADDRESS_COPY.VERIFIED_TITLE}
          </Box>
          <Box component="span" sx={styles.panelLine}>
            {formattedAddress}
          </Box>
          {cityLine && (
            <Box component="span" sx={styles.panelHint}>
              {cityLine}
            </Box>
          )}
        </Box>
        <Button
          onClick={onChange}
          size={BUTTON_SIZES.COMPACT}
          variant={BUTTON_VARIANTS.NEUTRAL}
          text={PROJECT_ADDRESS_COPY.CHANGE}
        />
      </Box>
    ),
    [ADDRESS_FIELD_STATUSES.UNVERIFIED]: () => (
      <Box role="alert" sx={styles.failurePanel}>
        <Box sx={styles.panelText}>
          <Box component="b" sx={styles.panelTitle(true)}>
            {failureTitle}
          </Box>
          <Box component="span" sx={styles.panelHint}>
            {PROJECT_ADDRESS_COPY.FAIL_HINT}
          </Box>
        </Box>
        <Button onClick={onRetry} size={BUTTON_SIZES.COMPACT} text={PROJECT_ADDRESS_COPY.RETRY} />
      </Box>
    ),
  };

  return PANEL_BY_STATUS[status]();
};

export default AddressStatusPanel;
