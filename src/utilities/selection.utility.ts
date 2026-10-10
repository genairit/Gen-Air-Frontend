export const toggleSelectedId = (currentId: string | null, clickedId: string) => {
  if (currentId === clickedId) {
    return null;
  }

  return clickedId;
};
