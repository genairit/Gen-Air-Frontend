import type { IDropdownOption } from "../interfaces/dropdown.interface";

export const findOptionIdByLabel = (options: IDropdownOption[], label: string | null) => {
  const option = options.find(candidate => candidate.label === label);

  if (!option) {
    return null;
  }

  return String(option.id);
};

export const findOptionLabelById = (options: IDropdownOption[], id: string | null) =>
  options.find(option => String(option.id) === id)?.label ?? null;

export const getOptionLabels = (options: IDropdownOption[]) => options.map(option => option.label);

interface INamedEntity {
  id: string;
  name: string;
}

export const toOptions = (entities: INamedEntity[]): IDropdownOption[] =>
  entities.map(entity => ({ id: entity.id, label: entity.name }));

export const withAllOption = (allLabel: string, options: IDropdownOption[]): IDropdownOption[] => [
  { id: "", label: allLabel },
  ...options,
];

export const toFilterId = (options: IDropdownOption[], label: string | null) =>
  findOptionIdByLabel(options, label) || null;
