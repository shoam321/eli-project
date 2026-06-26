import { useMemo, useState } from "react";

import { useLanguage } from "@/lib/language-context";
import { type ModuleDefinition, type ModuleField } from "@/lib/module-config";
import {
  buildDefaultDraft,
  filterWorkspaceRecords,
  useWorkspace,
  useWorkspaceState,
  type WorkspaceRecord,
} from "@/lib/workspace-data";

type OperationsModulePageProps = {
  moduleConfig: ModuleDefinition;
};

export default function OperationsModulePage({ moduleConfig }: OperationsModulePageProps) {
  const { deleteRecord, isBusy, saveRecord } = useWorkspace();
  const workspaceState = useWorkspaceState();
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<WorkspaceRecord | null>(null);
  const records = workspaceState[moduleConfig.slug];

  const filteredRecords = useMemo(
    () => filterWorkspaceRecords(records, query),
    [records, query],
  );

  function openCreateForm() {
    setDraft(buildDefaultDraft(moduleConfig.slug));
  }

  function openEditForm(record: WorkspaceRecord) {
    setDraft(record);
  }

  function closeForm() {
    setDraft(null);
  }

  function handleFieldChange(field: ModuleField, value: string | boolean) {
    if (!draft) {
      return;
    }

    setDraft({
      ...draft,
      [field.key]: value,
    });
  }

  async function saveDraft() {
    if (!draft) {
      return;
    }

    for (const field of moduleConfig.fields) {
      const value = draft[field.key];

      if (field.required && String(value ?? "").trim() === "") {
        window.alert(`${field.label}${t("fieldRequiredSuffix")}`);
        return;
      }
    }

    try {
      await saveRecord(moduleConfig.slug, draft);
      closeForm();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : t("unableToSave"));
    }
  }

  async function removeRecord(recordId: string) {
    if (!window.confirm(t("deleteRecordConfirm"))) {
      return;
    }

    try {
      await deleteRecord(moduleConfig.slug, recordId);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : t("unableToDelete"));
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_30px_120px_-50px_rgba(15,23,42,0.34)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-700">{t("originalSurface")}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{moduleConfig.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{moduleConfig.description}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.75)]">
          <p className="text-xs uppercase tracking-[0.26em] text-teal-300">{t("workspaceStats")}</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-4">
              <span>{t("storedRecords")}</span>
              <span className="text-lg font-semibold text-white">{records.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>{t("visibleAfterFilter")}</span>
              <span className="text-lg font-semibold text-white">{filteredRecords.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>{t("persistenceMode")}</span>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-teal-200">{t("supabaseWorkspace")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.42)] backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2 md:max-w-xl">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{t("searchRecords")}</label>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`${t("search")} ${moduleConfig.title.toLowerCase()}`}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white"
            />
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            disabled={isBusy}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            {t("add")} {moduleConfig.singular}
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {moduleConfig.columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={moduleConfig.columns.length + 1} className="px-4 py-10 text-center text-sm text-slate-500">
                      {moduleConfig.emptyMessage}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="align-top">
                      {moduleConfig.columns.map((column) => (
                        <td key={column.key} className="px-4 py-4 text-sm text-slate-700">
                          {formatRecordValue(record[column.key], t)}
                        </td>
                      ))}
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(record)}
                            disabled={isBusy}
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
                          >
                            {t("edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void removeRecord(record.id);
                            }}
                            disabled={isBusy}
                            className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                          >
                            {t("delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {draft ? (
        <section className="rounded-[2rem] border border-teal-200 bg-white/90 p-6 shadow-[0_24px_90px_-54px_rgba(13,148,136,0.42)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-700">{t("recordEditor")}</p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-900">
                {draft.id ? `${t("editRecord")} ${moduleConfig.singular}` : `${t("addRecord")} ${moduleConfig.singular}`}
              </h3>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              {t("close")}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {moduleConfig.fields.map((field) => (
              <label key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <span className="mb-2 block text-sm font-medium text-slate-700">{field.label}</span>
                {renderField({ field, draft, onChange: handleFieldChange, t })}
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveDraft}
              disabled={isBusy}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              {isBusy ? t("saving") : `${t("save")} ${moduleConfig.singular}`}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={isBusy}
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              {t("cancel")}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function renderField({
  field,
  draft,
  onChange,
  t,
}: {
  field: ModuleField;
  draft: WorkspaceRecord;
  onChange: (field: ModuleField, value: string | boolean) => void;
  t: (key: import("@/lib/translations").TranslationKey) => string;
}) {
  const commonClassName =
    "w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white";
  const value = draft[field.key];

  if (field.type === "textarea") {
    return (
      <textarea
        value={String(value ?? "")}
        onChange={(event) => onChange(field, event.target.value)}
        placeholder={field.placeholder}
        rows={4}
        className={`${commonClassName} resize-y rounded-[1.5rem]`}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={String(value ?? "")}
        onChange={(event) => onChange(field, event.target.value)}
        className={commonClassName}
      >
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <span className="flex min-h-[3rem] items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field, event.target.checked)}
          className="size-4 rounded border-slate-300 text-teal-600"
        />
        <span>{t("enableItem")}</span>
      </span>
    );
  }

  const inputType = field.type === "date" ? "date" : field.type === "number" || field.type === "currency" ? "number" : "text";

  return (
    <input
      type={inputType}
      step={field.type === "currency" ? "0.01" : undefined}
      value={String(value ?? "")}
      onChange={(event) => onChange(field, event.target.value)}
      placeholder={field.placeholder}
      className={commonClassName}
    />
  );
}

function formatRecordValue(
  value: WorkspaceRecord[string],
  t: (key: import("@/lib/translations").TranslationKey) => string,
) {
  if (typeof value === "boolean") {
    return value ? t("yesLabel") : t("noLabel");
  }

  if (value === "") {
    return "-";
  }

  return String(value ?? "-");
}
