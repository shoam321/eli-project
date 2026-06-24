import { moduleDefinitions, moduleOrder, type ModuleField, type ModuleSlug } from "@/lib/module-config";

export type WorkspaceRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: boolean | number | string;
};

export type WorkspaceState = Record<ModuleSlug, WorkspaceRecord[]>;

export const WORKSPACE_STORAGE_KEY = "ilab-manager-workspace:v1";

const EMPTY_STATE = moduleOrder.reduce((state, slug) => {
  state[slug] = [];
  return state;
}, {} as WorkspaceState);

function normalizeState(candidate: Partial<WorkspaceState> | null | undefined): WorkspaceState {
  const nextState = { ...EMPTY_STATE };

  if (!candidate) {
    return nextState;
  }

  for (const slug of moduleOrder) {
    nextState[slug] = Array.isArray(candidate[slug]) ? candidate[slug]! : [];
  }

  return nextState;
}

export function readWorkspaceState(): WorkspaceState {
  if (typeof window === "undefined") {
    return EMPTY_STATE;
  }

  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);

    if (!raw) {
      return EMPTY_STATE;
    }

    return normalizeState(JSON.parse(raw) as Partial<WorkspaceState>);
  } catch {
    return EMPTY_STATE;
  }
}

export function writeWorkspaceState(state: WorkspaceState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state));
}

export function buildDefaultDraft(slug: ModuleSlug): WorkspaceRecord {
  const definition = moduleDefinitions[slug];
  const now = new Date().toISOString();
  const record: WorkspaceRecord = {
    id: cryptoSafeId(),
    createdAt: now,
    updatedAt: now,
  };

  for (const field of definition.fields) {
    record[field.key] = getDefaultValue(field);
  }

  return record;
}

function getDefaultValue(field: ModuleField) {
  if (field.type === "checkbox") {
    return false;
  }

  if (field.type === "number" || field.type === "currency") {
    return "";
  }

  if (field.type === "date") {
    return new Date().toISOString().slice(0, 10);
  }

  if (field.type === "select") {
    return field.options?.[0]?.value ?? "";
  }

  return "";
}

function cryptoSafeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `local-${Math.random().toString(36).slice(2, 10)}`;
}

export function upsertWorkspaceRecord(
  state: WorkspaceState,
  slug: ModuleSlug,
  record: WorkspaceRecord,
): WorkspaceState {
  const records = state[slug];
  const existingIndex = records.findIndex((item) => item.id === record.id);
  const nextRecord = {
    ...record,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex === -1) {
    return {
      ...state,
      [slug]: [nextRecord, ...records],
    };
  }

  return {
    ...state,
    [slug]: records.map((item) => (item.id === nextRecord.id ? nextRecord : item)),
  };
}

export function deleteWorkspaceRecord(
  state: WorkspaceState,
  slug: ModuleSlug,
  recordId: string,
): WorkspaceState {
  return {
    ...state,
    [slug]: state[slug].filter((item) => item.id !== recordId),
  };
}

export function filterWorkspaceRecords(
  records: WorkspaceRecord[],
  query: string,
): WorkspaceRecord[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return records;
  }

  return records.filter((record) =>
    Object.values(record).some((value) =>
      String(value).toLowerCase().includes(normalizedQuery),
    ),
  );
}

export function exportWorkspaceState(state: WorkspaceState) {
  return JSON.stringify(state, null, 2);
}
