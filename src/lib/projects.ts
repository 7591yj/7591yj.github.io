import type { ProjectEntry } from "./content";
import type { ProjectStatus } from "../types";
import type { useTranslations } from "../i18n/ui";

type T = ReturnType<typeof useTranslations>;

const STATUS_KEYS = {
  released: "status.released",
  "in development": "status.inDevelopment",
  planned: "status.planned",
  prototype: "status.prototype",
  paused: "status.paused",
  archived: "status.archived",
} as const satisfies Record<ProjectStatus, Parameters<T>[0]>;

export function statusLabel(t: T, status: ProjectStatus): string {
  return t(STATUS_KEYS[status]);
}

export function sortProjects(entries: ProjectEntry[]): ProjectEntry[] {
  return [...entries].sort(
    (a, b) =>
      Number(!!b.data.current) - Number(!!a.data.current) ||
      b.data.year - a.data.year ||
      Number(!!b.data.images?.length) - Number(!!a.data.images?.length),
  );
}
