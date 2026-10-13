import type { FC } from "react";
import { Box } from "@mui/material";
import Icon from "../../../components/Icon/Icon";
import { useStyles } from "./CustomerSyncStep.style";
import { theme } from "../../../constants/theme.constants";
import { SYNC_STEP_ICON_BY_STATE } from "../../../constants/customer.constant";
import type { ICustomerSyncStep } from "../../../interfaces/customer.interface";

interface ICustomerSyncStepProps {
  position: number;
  step: ICustomerSyncStep;
}

const CustomerSyncStep: FC<ICustomerSyncStepProps> = ({ step, position }) => {
  const styles = useStyles();
  const badgeIcon = SYNC_STEP_ICON_BY_STATE[step.state];
  const badgeContent = badgeIcon ? (
    <Icon size={20} name={badgeIcon} color={theme.palette.white} />
  ) : (
    position
  );

  return (
    <Box sx={styles.step}>
      <Box component="span" sx={styles.badge(step.state)}>
        {badgeContent}
      </Box>
      <Box sx={styles.text}>
        <Box component="b" sx={styles.title}>
          {step.title}
        </Box>
        <Box component="span" sx={styles.caption}>
          {step.caption}
        </Box>
      </Box>
    </Box>
  );
};

export default CustomerSyncStep;
