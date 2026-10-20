import { createOneBasedRange } from "./number.utility";
import { PAGINATION, type PaginationItemType } from "../constants/pagination.constant";

interface IPaginationWindowOptions {
  page: number;
  pageCount: number;
}

const isVisiblePage = (pageNumber: number, { page, pageCount }: IPaginationWindowOptions) => {
  const isEdgePage = pageNumber === 1 || pageNumber === pageCount;
  const isNearCurrentPage = Math.abs(pageNumber - page) <= PAGINATION.SIBLING_COUNT;

  return isEdgePage || isNearCurrentPage;
};

export const getVisiblePaginationItems = (
  options: IPaginationWindowOptions,
): PaginationItemType[] => {
  const visiblePages = createOneBasedRange(options.pageCount).filter(pageNumber =>
    isVisiblePage(pageNumber, options),
  );

  return visiblePages.flatMap((pageNumber, index) => {
    const previousVisiblePage = visiblePages[index - 1] ?? pageNumber - 1;
    const hasHiddenPagesBefore = pageNumber - previousVisiblePage > 1;

    return hasHiddenPagesBefore ? [PAGINATION.GAP, pageNumber] : [pageNumber];
  });
};
