import { Button } from "@mui/material";
import React, { Suspense } from "react";
import SignatureIcon from "./SignatureIcon";
import useStyles from "./UltraSignature.style";
import type SignatureCanvas from "react-signature-canvas";
import { type Dispatch, type FC, type SetStateAction, useRef } from "react";

const ReactSignatureCanvas = React.lazy(() => import("react-signature-canvas"));

interface IUltraSignatureProps {
  isSigned: boolean;
  setIsSigned: Dispatch<SetStateAction<boolean>>;
}

const UltraSignature: FC<IUltraSignatureProps> = ({
  isSigned,
  setIsSigned,
}) => {
  const styles = useStyles();
  const signatureCanvas = useRef<SignatureCanvas | null>(null);

  const clearPad = () => {
    signatureCanvas.current?.clear();
    setIsSigned(false);
  };

  const handleBegin = () => {
    setIsSigned(true);
  };

  return (
    <div style={styles.signatureContainer}>
      <Suspense fallback={<div />}>
        <ReactSignatureCanvas
          penColor="black"
          ref={signatureCanvas}
          onBegin={handleBegin}
          canvasProps={{
            style: styles.signatureCanvas,
            onMouseDown: (e) => e.stopPropagation(),
            onTouchStart: (e) => e.stopPropagation(),
          }}
        />
      </Suspense>
      {!isSigned && <SignatureIcon style={styles.signatureIcon} />}
      <Button
        color="secondary"
        onClick={clearPad}
        variant="contained"
        disabled={!isSigned}
        style={styles.clearButton}
      >
        ניקוי
      </Button>
    </div>
  );
};

export default UltraSignature;
