import { useRef, useState, useMemo, type ChangeEvent } from "react";

import { useLanguage } from "@/lib/language-context";
import { deleteProductImage, uploadProductImage } from "@/lib/supabase/storage";
import {
  buildDefaultDraft,
  filterWorkspaceRecords,
  useWorkspace,
  useWorkspaceState,
  type WorkspaceRecord,
} from "@/lib/workspace-data";

type DeviceDraft = WorkspaceRecord;

const deviceStatusOptions = [
  { value: "client", labelEn: "Client", labelHe: "לקוח" },
  { value: "temporary", labelEn: "Temporary", labelHe: "זמני" },
  { value: "own", labelEn: "Own", labelHe: "חברה" },
  { value: "deleted", labelEn: "Deleted", labelHe: "נמחק" },
];

function newDeviceDraft(): DeviceDraft {
  const base = buildDefaultDraft("devices");
  return { ...base, status: "client", imageUrl: "" };
}

export default function DevicesPage() {
  const { deleteRecord, isBusy, saveRecord, session } = useWorkspace();
  const workspaceState = useWorkspaceState();
  const { t, lang } = useLanguage();

  const devices = workspaceState["devices"];
  const isRTL = lang === "he";

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<DeviceDraft | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDevices = useMemo(
    () => filterWorkspaceRecords(devices, query),
    [devices, query],
  );

  function openCreate() {
    setDraft(newDeviceDraft());
  }

  function openEdit(record: DeviceDraft) {
    setDraft({ ...record });
  }

  function closeForm() {
    setDraft(null);
  }

  function setField(key: string, value: string) {
    if (!draft) return;
    setDraft({ ...draft, [key]: value });
  }

  async function handleImageSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !draft || !session) return;

    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file, session.user.id, "devices");
      setDraft({ ...draft, imageUrl: url });
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t("unableToSave"));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemoveImage() {
    if (!draft) return;
    const oldUrl = String(draft.imageUrl ?? "");
    if (oldUrl) await deleteProductImage(oldUrl);
    setDraft({ ...draft, imageUrl: "" });
  }

  async function handleSave() {
    if (!draft) return;
    if (!String(draft.brand ?? "").trim()) {
      window.alert(`${isRTL ? "מותג" : "Brand"}${t("fieldRequiredSuffix")}`);
      return;
    }
    if (!String(draft.model ?? "").trim()) {
      window.alert(`${isRTL ? "דגם" : "Model"}${t("fieldRequiredSuffix")}`);
      return;
    }
    try {
      await saveRecord("devices", draft);
      closeForm();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t("unableToSave"));
    }
  }

  async function handleDelete(recordId: string) {
    if (!window.confirm(t("deleteRecordConfirm"))) return;
    const record = devices.find((d) => d.id === recordId);
    try {
      await deleteRecord("devices", recordId);
      if (record && String(record.imageUrl ?? "")) {
        await deleteProductImage(String(record.imageUrl));
      }
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t("unableToDelete"));
    }
  }

  const inputClass =
    "w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_30px_120px_-50px_rgba(15,23,42,0.34)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-700">{t("originalSurface")}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{t("moduleDevices")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t("moduleDevicesDesc")}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.75)]">
          <p className="text-xs uppercase tracking-[0.26em] text-teal-300">{t("workspaceStats")}</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-4">
              <span>{t("storedRecords")}</span>
              <span className="text-lg font-semibold text-white">{devices.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>{t("visibleAfterFilter")}</span>
              <span className="text-lg font-semibold text-white">{filteredDevices.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>{t("persistenceMode")}</span>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-teal-200">{t("supabaseWorkspace")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search + add */}
      <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.42)] backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2 md:max-w-xl">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{t("searchRecords")}</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`${t("search")} ${t("moduleDevices").toLowerCase()}`}
              className={inputClass}
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            disabled={isBusy}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            {t("add")} {isRTL ? "מכשיר" : "Device"}
          </button>
        </div>

        {/* Device cards */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDevices.length === 0 ? (
            <p className="col-span-full py-10 text-center text-sm text-slate-500">
              {devices.length === 0 ? t("moduleDevicesDesc") : `${t("search")}: "${query}"`}
            </p>
          ) : (
            filteredDevices.map((device) => {
              const statusObj = deviceStatusOptions.find((o) => o.value === device.status);
              const statusLabel = statusObj ? (isRTL ? statusObj.labelHe : statusObj.labelEn) : String(device.status ?? "");
              return (
                <DeviceCard
                  key={device.id}
                  device={device}
                  statusLabel={statusLabel}
                  isBusy={isBusy}
                  isRTL={isRTL}
                  onEdit={() => openEdit(device)}
                  onDelete={() => { void handleDelete(device.id); }}
                  t={t}
                />
              );
            })
          )}
        </div>
      </section>

      {/* Edit / create form */}
      {draft ? (
        <section className="rounded-[2rem] border border-teal-200 bg-white/90 p-6 shadow-[0_24px_90px_-54px_rgba(13,148,136,0.42)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-700">{t("recordEditor")}</p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-900">
                {devices.some((d) => d.id === draft.id)
                  ? `${t("editRecord")} ${isRTL ? "מכשיר" : "Device"}`
                  : `${t("addRecord")} ${isRTL ? "מכשיר" : "Device"}`}
              </h3>
            </div>
            <button type="button" onClick={closeForm} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
              {t("close")}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Brand */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{isRTL ? "מותג *" : "Brand *"}</span>
              <input type="text" value={String(draft.brand ?? "")} onChange={(e) => setField("brand", e.target.value)} className={inputClass} placeholder="Apple" required />
            </label>

            {/* Model */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{isRTL ? "דגם *" : "Model *"}</span>
              <input type="text" value={String(draft.model ?? "")} onChange={(e) => setField("model", e.target.value)} className={inputClass} placeholder="iPhone 14 Pro" required />
            </label>

            {/* Serial */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{isRTL ? "סריאלי / IMEI" : "Serial / IMEI"}</span>
              <input type="text" value={String(draft.serialNumber ?? "")} onChange={(e) => setField("serialNumber", e.target.value)} className={inputClass} placeholder={isRTL ? "סריאלי או IMEI" : "Serial or IMEI"} />
            </label>

            {/* Status */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{isRTL ? "סטטוס" : "Status"}</span>
              <select value={String(draft.status ?? "client")} onChange={(e) => setField("status", e.target.value)} className={inputClass}>
                {deviceStatusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{isRTL ? o.labelHe : o.labelEn}</option>
                ))}
              </select>
            </label>

            {/* Owner */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{isRTL ? "בעלים" : "Owner"}</span>
              <input type="text" value={String(draft.owner ?? "")} onChange={(e) => setField("owner", e.target.value)} className={inputClass} placeholder={isRTL ? "לקוח, חברה או מחזיק זמני" : "Client, company, or temporary holder"} />
            </label>

            {/* Image upload */}
            <div className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("productImage")}</span>
              <div className="flex flex-wrap items-center gap-4">
                {draft.imageUrl ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={String(draft.imageUrl)} alt={t("imagePreview")} className="h-24 w-24 rounded-2xl border border-slate-200 object-cover" />
                    <button type="button" onClick={() => { void handleRemoveImage(); }} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs text-white hover:bg-rose-700">
                      ×
                    </button>
                  </div>
                ) : null}
                <label className={`cursor-pointer rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700 ${uploadingImage ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {uploadingImage ? t("uploading") : draft.imageUrl ? t("changeImage") : t("uploadImage")}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={uploadingImage} onChange={(e) => { void handleImageSelect(e); }} />
                </label>
              </div>
            </div>

            {/* Notes */}
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">{isRTL ? "הערות" : "Notes"}</span>
              <textarea value={String(draft.notes ?? "")} onChange={(e) => setField("notes", e.target.value)} rows={2} className={`${inputClass} resize-y rounded-[1.5rem]`} placeholder={isRTL ? "מצב, אביזרים, נעילה" : "Condition, accessories, lock state"} />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => { void handleSave(); }} disabled={isBusy || uploadingImage} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60">
              {isBusy ? t("saving") : `${t("save")} ${isRTL ? "מכשיר" : "Device"}`}
            </button>
            <button type="button" onClick={closeForm} disabled={isBusy} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900">
              {t("cancel")}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DeviceCard({
  device,
  statusLabel,
  isBusy,
  isRTL,
  onEdit,
  onDelete,
  t,
}: {
  device: DeviceDraft;
  statusLabel: string;
  isBusy: boolean;
  isRTL: boolean;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: import("@/lib/translations").TranslationKey) => string;
}) {
  const imageUrl = String(device.imageUrl ?? "");

  const statusColor: Record<string, string> = {
    client: "bg-sky-500/15 text-sky-700",
    temporary: "bg-amber-500/15 text-amber-700",
    own: "bg-teal-500/15 text-teal-700",
    deleted: "bg-slate-500/15 text-slate-500",
  };
  const colorClass = statusColor[String(device.status ?? "client")] ?? "bg-slate-100 text-slate-600";

  return (
    <div className="flex flex-col rounded-[1.75rem] border border-slate-200 bg-white/90 shadow-[0_16px_60px_-40px_rgba(15,23,42,0.3)]">
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden rounded-t-[1.75rem] bg-slate-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={`${String(device.brand ?? "")} ${String(device.model ?? "")}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 15.75h3" />
            </svg>
          </div>
        )}
        <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
          {statusLabel}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h4 className="font-semibold text-slate-900">{String(device.brand ?? "")} {String(device.model ?? "")}</h4>
        {String(device.serialNumber ?? "") ? (
          <p className="mt-0.5 font-mono text-xs text-slate-400">{String(device.serialNumber)}</p>
        ) : null}
        {String(device.owner ?? "") ? (
          <p className="mt-1 text-xs text-slate-500">{isRTL ? "בעלים" : "Owner"}: {String(device.owner)}</p>
        ) : null}
        <div className="mt-auto flex justify-end gap-2 pt-3">
          <button type="button" onClick={onEdit} disabled={isBusy} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700">
            {t("edit")}
          </button>
          <button type="button" onClick={onDelete} disabled={isBusy} className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
