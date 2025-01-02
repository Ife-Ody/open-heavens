export const truncate = (
  str: string | null | undefined,
  length: number,
): string | null => {
  if (!str) return null;
  const strValue = String(str);
  if (strValue.length <= length) return strValue;
  return `${strValue.slice(0, length - 3)}...`;
};
