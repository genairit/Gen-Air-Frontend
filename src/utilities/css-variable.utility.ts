// A name longer than "extends" stops the pyramid JSX plugin from reordering this generic as JSX.
type TRecordKey = string;

const toKebabCase = (value: string) =>
  value.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

const toCssVariableName = (prefix: string, key: string) => `--${prefix}-${toKebabCase(key)}`;

export const createCssVariableReferences = <TKey extends TRecordKey>(
  record: Record<TKey, string>,
  prefix: string,
): Record<TKey, string> => {
  const references = Object.keys(record).map(key => [
    key,
    `var(${toCssVariableName(prefix, key)})`,
  ]);

  return Object.fromEntries(references);
};

export const createCssVariableDeclarations = (record: Record<string, string>, prefix: string) => {
  const declarations = Object.entries(record).map(([key, value]) => [
    toCssVariableName(prefix, key),
    value,
  ]);

  return Object.fromEntries(declarations);
};
