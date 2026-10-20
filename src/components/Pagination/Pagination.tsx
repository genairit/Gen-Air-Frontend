import {
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
  type ButtonVariantType,
} from "../Button/constants/button.constants";

import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "../Button/Button";
import { useStyles } from "./Pagination.style";
import { getVisiblePaginationItems } from "../../utilities/pagination.utility";
import { PAGINATION, type PaginationItemType } from "../../constants/pagination.constant";

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
  const visibleItems = getVisiblePaginationItems({ page, pageCount });

  const renderItem = (item: PaginationItemType, index: number) => {
    if (item === PAGINATION.GAP) {
      return (
        <Box aria-hidden component="span" key={`gap-${index}`} sx={styles.ellipsis}>
          {PAGINATION.ELLIPSIS}
        </Box>
      );
    }

    const isActive = item === page;

    return (
      <Button
        key={item}
        text={String(item)}
        shape={BUTTON_SHAPES.CIRCLE}
        onClick={() => onChange(item)}
        sx={styles.page({ isActive })}
        variant={getPageVariant(isActive)}
      />
    );
  };

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
      {visibleItems.map(renderItem)}
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
