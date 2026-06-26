import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import {
  createElement,
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import { moduleDefinitions, moduleOrder, type ModuleField, type ModuleSlug } from "@/lib/module-config";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type WorkspaceRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: boolean | number | string;
};

export type WorkspaceState = Record<ModuleSlug, WorkspaceRecord[]>;
export type WorkspaceStatus = "loading" | "ready" | "unauthenticated" | "error";

type WorkspaceContextValue = {
  state: WorkspaceState;
  status: WorkspaceStatus;
  session: Session | null;
  errorMessage: string | null;
  isBusy: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<"signed-in" | "confirm-email">;
  signOut: () => Promise<void>;
  saveRecord: (slug: ModuleSlug, record: WorkspaceRecord) => Promise<void>;
  deleteRecord: (slug: ModuleSlug, recordId: string) => Promise<void>;
  resetWorkspace: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
};

type SupabaseRow = Record<string, boolean | number | string | null>;

type ModuleStorageAdapter = {
  table: string;
  fromRow: (row: Record<string, unknown>) => WorkspaceRecord;
  toRow: (record: WorkspaceRecord, userId: string) => SupabaseRow;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const EMPTY_STATE = createEmptyWorkspaceState();

const moduleStorageAdapters: Record<ModuleSlug, ModuleStorageAdapter> = {
  "products": {
    table: "products",
    fromRow: (row) => ({
      id: toText(row.id),
      createdAt: toTimestamp(row.created_at),
      updatedAt: toTimestamp(row.updated_at),
      name: toText(row.name),
      description: toText(row.description),
      category: toText(row.category),
      price: toNumberOrEmpty(row.price),
      quantity: toNumberOrEmpty(row.quantity),
      imageUrl: toText(row.image_url),
      clientId: toText(row.client_id),
      status: toText(row.status),
      notes: toText(row.notes),
    }),
    toRow: (record, userId) => ({
      id: record.id,
      owner_user_id: userId,
      client_id: toNullableText(record.clientId),
      name: toText(record.name),
      description: toNullableText(record.description),
      category: toNullableText(record.category),
      price: toDecimalValue(record.price),
      quantity: toNumberValue(record.quantity),
      image_url: toNullableText(record.imageUrl),
      status: toText(record.status) || "active",
      notes: toNullableText(record.notes),
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    }),
  },
  "projects": {
    table: "projects",
    fromRow: (row) => ({
      id: toText(row.id),
      createdAt: toTimestamp(row.created_at),
      updatedAt: toTimestamp(row.updated_at),
      customerName: toText(row.customer_name),
      email: toText(row.email),
      deviceName: toText(row.device_name),
      serialNumber: toText(row.serial_number),
      status: toText(row.project_status),
      dueDate: toOptionalDate(row.due_date),
      notes: toText(row.notes),
    }),
    toRow: (record, userId) => ({
      id: record.id,
      owner_user_id: userId,
      customer_name: toText(record.customerName),
      email: toNullableText(record.email),
      device_name: toText(record.deviceName),
      serial_number: toNullableText(record.serialNumber),
      project_status: toText(record.status),
      due_date: toNullableText(record.dueDate),
      notes: toNullableText(record.notes),
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    }),
  },
  "draft-projects": {
    table: "draft_projects",
    fromRow: (row) => ({
      id: toText(row.id),
      createdAt: toTimestamp(row.created_at),
      updatedAt: toTimestamp(row.updated_at),
      customerName: toText(row.customer_name),
      phone: toText(row.phone),
      deviceModel: toText(row.device_model),
      isTemporary: Boolean(row.is_temporary),
      quoteStatus: toText(row.quote_status),
      notes: toText(row.notes),
    }),
    toRow: (record, userId) => ({
      id: record.id,
      owner_user_id: userId,
      customer_name: toText(record.customerName),
      phone: toNullableText(record.phone),
      device_model: toText(record.deviceModel),
      is_temporary: Boolean(record.isTemporary),
      quote_status: toText(record.quoteStatus),
      notes: toNullableText(record.notes),
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    }),
  },
  "clients": {
    table: "clients",
    fromRow: (row) => ({
      id: toText(row.id),
      createdAt: toTimestamp(row.created_at),
      updatedAt: toTimestamp(row.updated_at),
      firstName: toText(row.first_name),
      lastName: toText(row.last_name),
      phone: toText(row.phone),
      email: toText(row.email),
      company: toText(row.company),
      notes: toText(row.notes),
    }),
    toRow: (record, userId) => ({
      id: record.id,
      owner_user_id: userId,
      first_name: toText(record.firstName),
      last_name: toText(record.lastName),
      phone: toNullableText(record.phone),
      email: toNullableText(record.email),
      company: toNullableText(record.company),
      notes: toNullableText(record.notes),
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    }),
  },
  "suppliers": {
    table: "suppliers",
    fromRow: (row) => ({
      id: toText(row.id),
      createdAt: toTimestamp(row.created_at),
      updatedAt: toTimestamp(row.updated_at),
      name: toText(row.name),
      phone: toText(row.phone),
      email: toText(row.email),
      website: toText(row.website),
      notes: toText(row.notes),
    }),
    toRow: (record, userId) => ({
      id: record.id,
      owner_user_id: userId,
      name: toText(record.name),
      phone: toNullableText(record.phone),
      email: toNullableText(record.email),
      website: toNullableText(record.website),
      notes: toNullableText(record.notes),
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    }),
  },
  "parts": {
    table: "parts",
    fromRow: (row) => ({
      id: toText(row.id),
      createdAt: toTimestamp(row.created_at),
      updatedAt: toTimestamp(row.updated_at),
      name: toText(row.name),
      supplier: toText(row.supplier_name),
      model: toText(row.model_name),
      serial: toText(row.serial_sku),
      quantity: toNumberOrEmpty(row.quantity),
      price: toNumberOrEmpty(row.unit_price),
      notes: toText(row.notes),
    }),
    toRow: (record, userId) => ({
      id: record.id,
      owner_user_id: userId,
      supplier_name: toNullableText(record.supplier),
      name: toText(record.name),
      brand_name: null,
      model_name: toNullableText(record.model),
      serial_sku: toNullableText(record.serial),
      quantity: toNumberValue(record.quantity),
      unit_price: toDecimalValue(record.price),
      notes: toNullableText(record.notes),
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    }),
  },
  "orders": {
    table: "orders",
    fromRow: (row) => ({
      id: toText(row.id),
      createdAt: toTimestamp(row.created_at),
      updatedAt: toTimestamp(row.updated_at),
      orderNumber: toText(row.order_number),
      supplier: toText(row.supplier_name),
      status: toText(row.order_status),
      expectedDate: toOptionalDate(row.expected_date),
      amount: toNumberOrEmpty(row.amount),
      price: toNumberOrEmpty(row.total_price),
      notes: toText(row.notes),
    }),
    toRow: (record, userId) => ({
      id: record.id,
      owner_user_id: userId,
      order_number: toText(record.orderNumber),
      supplier_name: toNullableText(record.supplier),
      order_status: toText(record.status),
      expected_date: toNullableText(record.expectedDate),
      amount: toNumberValue(record.amount),
      total_price: toDecimalValue(record.price),
      notes: toNullableText(record.notes),
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    }),
  },
  "devices": {
    table: "devices",
    fromRow: (row) => ({
      id: toText(row.id),
      createdAt: toTimestamp(row.created_at),
      updatedAt: toTimestamp(row.updated_at),
      brand: toText(row.brand_name),
      model: toText(row.model_name),
      serialNumber: toText(row.serial_number),
      status: toText(row.device_status),
      owner: toText(row.owner_name),
      notes: toText(row.notes),
    }),
    toRow: (record, userId) => ({
      id: record.id,
      owner_user_id: userId,
      brand_name: toText(record.brand),
      model_name: toText(record.model),
      serial_number: toNullableText(record.serialNumber),
      device_status: toText(record.status),
      owner_name: toNullableText(record.owner),
      notes: toNullableText(record.notes),
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    }),
  },
  "cashiers": {
    table: "cashiers",
    fromRow: (row) => ({
      id: toText(row.id),
      createdAt: toTimestamp(row.created_at),
      updatedAt: toTimestamp(row.updated_at),
      itemName: toText(row.item_name),
      itemType: toText(row.item_type),
      quantity: toNumberOrEmpty(row.quantity),
      price: toNumberOrEmpty(row.price),
      soldAt: toOptionalDate(row.sold_at),
      notes: toText(row.notes),
    }),
    toRow: (record, userId) => ({
      id: record.id,
      owner_user_id: userId,
      item_name: toText(record.itemName),
      item_type: toText(record.itemType),
      quantity: toNumberValue(record.quantity),
      price: toDecimalValue(record.price),
      sold_at: toNullableText(record.soldAt),
      notes: toNullableText(record.notes),
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    }),
  },
  "brands": {
    table: "brands",
    fromRow: (row) => ({
      id: toText(row.id),
      createdAt: toTimestamp(row.created_at),
      updatedAt: toTimestamp(row.updated_at),
      name: toText(row.name),
      active: Boolean(row.active),
      notes: toText(row.notes),
    }),
    toRow: (record, userId) => ({
      id: record.id,
      owner_user_id: userId,
      name: toText(record.name),
      active: Boolean(record.active),
      notes: toNullableText(record.notes),
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    }),
  },
  "models": {
    table: "models",
    fromRow: (row) => ({
      id: toText(row.id),
      createdAt: toTimestamp(row.created_at),
      updatedAt: toTimestamp(row.updated_at),
      brand: toText(row.brand_name),
      name: toText(row.name),
      active: Boolean(row.active),
      notes: toText(row.notes),
    }),
    toRow: (record, userId) => ({
      id: record.id,
      owner_user_id: userId,
      brand_name: toText(record.brand),
      name: toText(record.name),
      active: Boolean(record.active),
      notes: toNullableText(record.notes),
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    }),
  },
};

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const [supabase] = useState<SupabaseClient>(() => createBrowserSupabaseClient());
  const [state, setState] = useState<WorkspaceState>(EMPTY_STATE);
  const [status, setStatus] = useState<WorkspaceStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const browserSupabase = supabase;
    let cancelled = false;

    async function syncSession(nextSession: Session | null) {
      if (cancelled) {
        return;
      }

      setSession(nextSession);
      setErrorMessage(null);

      if (!nextSession) {
        setState(createEmptyWorkspaceState());
        setStatus("unauthenticated");
        return;
      }

      setStatus("loading");

      try {
        await ensureProfile(browserSupabase, nextSession.user);
        const nextState = await loadWorkspaceState(browserSupabase);

        if (cancelled) {
          return;
        }

        setState(nextState);
        setStatus("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(toErrorMessage(error));
        setStatus("error");
      }
    }

    browserSupabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          throw error;
        }

        return syncSession(data.session);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setErrorMessage(toErrorMessage(error));
        setStatus("error");
      });

    const {
      data: { subscription },
    } = browserSupabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncSession(nextSession);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function refreshWorkspace() {
    if (!supabase) {
      return;
    }

    setErrorMessage(null);

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }

    if (!data.session) {
      setSession(null);
      setState(createEmptyWorkspaceState());
      setStatus("unauthenticated");
      return;
    }

    setStatus("loading");

    try {
      await ensureProfile(supabase, data.session.user);
      const nextState = await loadWorkspaceState(supabase);

      setSession(data.session);
      setState(nextState);
      setStatus("ready");
    } catch (loadError) {
      setErrorMessage(toErrorMessage(loadError));
      setStatus("error");
    }
  }

  async function signIn(email: string, password: string) {
    if (!supabase) {
      throw new Error("Supabase client is not ready yet.");
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }
    } catch (error) {
      const nextMessage = toErrorMessage(error);
      setErrorMessage(nextMessage);
      throw new Error(nextMessage);
    } finally {
      setIsBusy(false);
    }
  }

  async function signUp(email: string, password: string) {
    if (!supabase) {
      throw new Error("Supabase client is not ready yet.");
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        throw error;
      }

      return data.session ? "signed-in" : "confirm-email";
    } catch (error) {
      const nextMessage = toErrorMessage(error);
      setErrorMessage(nextMessage);
      throw new Error(nextMessage);
    } finally {
      setIsBusy(false);
    }
  }

  async function signOut() {
    if (!supabase) {
      throw new Error("Supabase client is not ready yet.");
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    } catch (error) {
      const nextMessage = toErrorMessage(error);
      setErrorMessage(nextMessage);
      throw new Error(nextMessage);
    } finally {
      setIsBusy(false);
    }
  }

  async function saveRecord(slug: ModuleSlug, record: WorkspaceRecord) {
    if (!supabase || !session) {
      throw new Error("Sign in before saving workspace data.");
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      const adapter = moduleStorageAdapters[slug];
      const nextRecord = {
        ...record,
        updatedAt: new Date().toISOString(),
      };
      const { error } = await supabase
        .from(adapter.table)
        .upsert(adapter.toRow(nextRecord, session.user.id), { onConflict: "id" });

      if (error) {
        throw error;
      }

      setState((currentState) => upsertWorkspaceRecord(currentState, slug, nextRecord));
    } catch (error) {
      const nextMessage = toErrorMessage(error);
      setErrorMessage(nextMessage);
      throw new Error(nextMessage);
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteRecord(slug: ModuleSlug, recordId: string) {
    if (!supabase || !session) {
      throw new Error("Sign in before deleting workspace data.");
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      const adapter = moduleStorageAdapters[slug];
      const { error } = await supabase
        .from(adapter.table)
        .delete()
        .eq("id", recordId);

      if (error) {
        throw error;
      }

      setState((currentState) => deleteWorkspaceRecord(currentState, slug, recordId));
    } catch (error) {
      const nextMessage = toErrorMessage(error);
      setErrorMessage(nextMessage);
      throw new Error(nextMessage);
    } finally {
      setIsBusy(false);
    }
  }

  async function resetWorkspace() {
    if (!supabase || !session) {
      throw new Error("Sign in before resetting workspace data.");
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      for (const slug of moduleOrder) {
        const adapter = moduleStorageAdapters[slug];
        const { error } = await supabase
          .from(adapter.table)
          .delete()
          .eq("owner_user_id", session.user.id);

        if (error) {
          throw error;
        }
      }

      setState(createEmptyWorkspaceState());
    } catch (error) {
      const nextMessage = toErrorMessage(error);
      setErrorMessage(nextMessage);
      throw new Error(nextMessage);
    } finally {
      setIsBusy(false);
    }
  }

  return createElement(
    WorkspaceContext.Provider,
    {
      value: {
        state,
        status,
        session,
        errorMessage,
        isBusy,
        signIn,
        signUp,
        signOut,
        saveRecord,
        deleteRecord,
        resetWorkspace,
        refreshWorkspace,
      },
    },
    children,
  );
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

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider.");
  }

  return context;
}

export function useWorkspaceState() {
  return useWorkspace().state;
}

function createEmptyWorkspaceState(): WorkspaceState {
  return moduleOrder.reduce((state, slug) => {
    state[slug] = [];
    return state;
  }, {} as WorkspaceState);
}

async function ensureProfile(supabase: SupabaseClient, user: User) {
  const fullName =
    typeof user.user_metadata.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : user.email?.split("@")[0] ?? "Workspace Manager";

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
}

async function loadWorkspaceState(supabase: SupabaseClient): Promise<WorkspaceState> {
  const nextState = createEmptyWorkspaceState();

  await Promise.all(
    moduleOrder.map(async (slug) => {
      const adapter = moduleStorageAdapters[slug];
      const { data, error } = await supabase
        .from(adapter.table)
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      nextState[slug] = (data ?? []).map((row) => adapter.fromRow(row as Record<string, unknown>));
    }),
  );

  return nextState;
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected workspace error.";
}

function toText(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function toNullableText(value: unknown) {
  const text = toText(value).trim();
  return text ? text : null;
}

function toTimestamp(value: unknown) {
  const text = toText(value);
  return text || new Date().toISOString();
}

function toOptionalDate(value: unknown) {
  return toText(value);
}

function toNumberOrEmpty(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : "";
}

function toNumberValue(value: unknown) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function toDecimalValue(value: unknown) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}
