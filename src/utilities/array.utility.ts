interface IPageOptions {
  page: number;
  pageSize: number;
}

export const moveItem = <TItem>(items: TItem[], fromIndex: number, toIndex: number) => {
  const reordered = [...items];
  const [movedItem] = reordered.splice(fromIndex, 1);

  reordered.splice(toIndex, 0, movedItem);

  return reordered;
};

export const getPageCount = (itemCount: number, pageSize: number) =>
  Math.max(1, Math.ceil(itemCount / pageSize));

export const getPageItems = <TItem>(items: TItem[], { page, pageSize }: IPageOptions) => {
  const startIndex = (page - 1) * pageSize;

  return items.slice(startIndex, startIndex + pageSize);
};
