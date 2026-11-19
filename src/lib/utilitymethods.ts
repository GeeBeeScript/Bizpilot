export const getInitials = (value: string) => {
  const initials = value
    .trim()
    .split(/\s+/)
    .map((item) => item[0].toUpperCase())
    .join("");
  return initials;
};
