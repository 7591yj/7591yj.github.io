export type AboutTableCell =
  | string
  | { type: "link"; label: string; href: string }
  | { type: "lines"; lines: string[] };

export type AboutTableRow = AboutTableCell[];
