export const cn = (...classNames: (string | any)[]) =>
  classNames.filter(Boolean).join(" ");
