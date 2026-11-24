import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "../Button/Button";
import InlineError from "../InlineError/InlineError";
import { usePageStyles } from "../../pages/page.style";
import { BUTTON_VARIANTS } from "../Button/constants/button.constants";
import { CONTACT_DIRECTORY_SEARCH_COPY } from "../../constants/contact-directory-search.constant";

interface IContactDirectorySearchErrorProps {
  busy: boolean;
  message: string;
  onRetry: () => Promise<void>;
}

const ContactDirectorySearchError: FC<IContactDirectorySearchErrorProps> = ({
  busy,
  message,
  onRetry,
}) => {
  const styles = usePageStyles();

  return (
    <Box sx={[styles.stack({ gap: "8px" }), styles.wrappingText]}>
      <InlineError message={message} />
      <Button
        disabled={busy}
        onClick={onRetry}
        variant={BUTTON_VARIANTS.NEUTRAL}
        text={CONTACT_DIRECTORY_SEARCH_COPY.RETRY}
      />
    </Box>
  );
};

export default ContactDirectorySearchError;
