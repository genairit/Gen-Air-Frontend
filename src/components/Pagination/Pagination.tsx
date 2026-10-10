import {
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
  type ButtonVariantType,
} from "../Button/constants/button.constants";

import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "../Button/Button";
import { useStyles } from "./Pagination.style";
import { createOneBasedRange } from "../../utilities/number.utility";

interface IPaginationProps {
  page: number;
  pageCount: number;
  nextLabel: string;
  previousLabel: string;
  onChange: (page: number) => void;
}

const getPageVariant = (isActive: boolean): ButtonVariantType =>
  isActive ? BUTTON_VARIANTS.DARK : BUTTON_VARIANTS.NEUTRAL;

const Pagination: FC<IPaginationProps> = ({
  page,
  pageCount,
  onChange,
  nextLabel,
  previousLabel,
}) => {
  const styles = useStyles();
  const isFirstPage = page <= 1;
  const isLastPage = page >= pageCount;

  return (
    <Box component="nav" sx={styles.container}>
      <Button
        text="›"
        disabled={isFirstPage}
        ariaLabel={previousLabel}
        shape={BUTTON_SHAPES.CIRCLE}
        variant={BUTTON_VARIANTS.NEUTRAL}
        onClick={() => onChange(page - 1)}
      />
      {createOneBasedRange(pageCount).map(pageNumber => (
        <Button
          key={pageNumber}
          text={String(pageNumber)}
          shape={BUTTON_SHAPES.CIRCLE}
          onClick={() => onChange(pageNumber)}
          variant={getPageVariant(pageNumber === page)}
          sx={styles.page({ isActive: pageNumber === page })}
        />
      ))}
      <Button
        text="‹"
        ariaLabel={nextLabel}
        disabled={isLastPage}
        shape={BUTTON_SHAPES.CIRCLE}
        variant={BUTTON_VARIANTS.NEUTRAL}
        onClick={() => onChange(page + 1)}
      />
    </Box>
  );
};

export default Pagination;
