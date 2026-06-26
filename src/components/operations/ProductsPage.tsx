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

type ProductDraft = WorkspaceRecord;

function newProductDraft(): ProductDraft {
  const base = buildDefaultDraft("products");
  return { ...base, status: "active", imageUrl: "", clientId: "" };
}

export default function ProductsPage() {
  const { deleteRecord, isBusy, saveRecord, session } = useWorkspace();
  const workspaceState = useWorkspaceState();
  const { t, lang } = useLanguage();

  const products = workspaceState["products"];
  const clients = workspaceState["clients"];

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(
    () => filterWorkspaceRecords(products, query),
    [products, query],
  );

  const isRTL = lang === "he";

  function openCreate() {
    setDraft(newProductDraft());
  }

  function openEdit(record: ProductDraft) {
    setDraft({ ...record });
  }

  function closeForm() {
    setDraft(null);
  }

  function setField(key: string, value: string | boolean | number) {
    if (!draft) return;
    setDraft({ ...draft, [key]: value });
  }

  async function handleImageSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !draft || !session) return;

    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file, session.user.id);
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
    if (!String(draft.name ?? "").trim()) {
      window.alert(`${t("productName")}${t("fieldRequiredSuffix")}`);
      return;
    }
    try {
      await saveRecord("products", draft);
      closeForm();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t("unableToSave"));
    }
  }

  async function handleDelete(recordId: string) {
    if (!window.confirm(t("deleteRecordConfirm"))) return;
    const record = products.find((p) => p.id === recordId);
    try {
      await deleteRecord("products", recordId);
      if (record && String(record.imageUrl ?? "")) {
        await deleteProductImage(String(record.imageUrl));
      }
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t("unableToDelete"));
    }
  }

  function getClientName(clientId: string) {
    if (!clientId) return "";
    const client = clients.find((c) => c.id === clientId);
    if (!client) return clientId;
    return `${String(client.firstName ?? "")} ${String(client.lastName ?? "")}`.trim();
  }

  const inputClass =
    "w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white";

  return (
    <div className="space-y-6">
      {/* Stats + header */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_30px_120px_-50px_rgba(15,23,42,0.34)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-700">{t("originalSurface")}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{t("moduleProducts")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t("moduleProductsDesc")}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.75)]">
          <p className="text-xs uppercase tracking-[0.26em] text-teal-300">{t("workspaceStats")}</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-4">
              <span>{t("storedRecords")}</span>
              <span className="text-lg font-semibold text-white">{products.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>{t("visibleAfterFilter")}</span>
              <span className="text-lg font-semibold text-white">{filteredProducts.length}</span>
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
              placeholder={`${t("search")} ${t("moduleProducts").toLowerCase()}`}
              className={inputClass}
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            disabled={isBusy}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            {t("add")} {isRTL ? "מוצר" : "Product"}
          </button>
        </div>

        {/* Products grid */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.length === 0 ? (
            <p className="col-span-full py-10 text-center text-sm text-slate-500">
              {products.length === 0 ? t("moduleProductsDesc") : `${t("search")}: "${query}"`}
            </p>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                clientName={getClientName(String(product.clientId ?? ""))}
                isBusy={isBusy}
                onEdit={() => openEdit(product)}
                onDelete={() => { void handleDelete(product.id); }}
                t={t}
              />
            ))
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
                {draft.id && products.some((p) => p.id === draft.id)
                  ? `${t("editRecord")} ${isRTL ? "מוצר" : "Product"}`
                  : `${t("addRecord")} ${isRTL ? "מוצר" : "Product"}`}
              </h3>
            </div>
            <button type="button" onClick={closeForm} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
              {t("close")}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Product name */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("productName")} *</span>
              <input type="text" value={String(draft.name ?? "")} onChange={(e) => setField("name", e.target.value)} className={inputClass} placeholder={isRTL ? "שם המוצר" : "Product name"} required />
            </label>

            {/* Category */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("productCategory")}</span>
              <input type="text" value={String(draft.category ?? "")} onChange={(e) => setField("category", e.target.value)} className={inputClass} placeholder={isRTL ? "למשל: מסך, סוללה" : "e.g. Screen, Battery"} />
            </label>

            {/* Price */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("priceLabel")} *</span>
              <input type="number" step="0.01" min="0" value={String(draft.price ?? "")} onChange={(e) => setField("price", e.target.value)} className={inputClass} placeholder="0.00" required />
            </label>

            {/* Quantity */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("quantityLabel")}</span>
              <input type="number" min="0" value={String(draft.quantity ?? "")} onChange={(e) => setField("quantity", e.target.value)} className={inputClass} placeholder="0" />
            </label>

            {/* Client linking */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("linkToClient")}</span>
              <select value={String(draft.clientId ?? "")} onChange={(e) => setField("clientId", e.target.value)} className={inputClass}>
                <option value="">{t("noClientLinked")}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {String(c.firstName ?? "")} {String(c.lastName ?? "")} {c.phone ? `· ${String(c.phone)}` : ""}
                  </option>
                ))}
              </select>
            </label>

            {/* Status */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("productStatus")}</span>
              <select value={String(draft.status ?? "active")} onChange={(e) => setField("status", e.target.value)} className={inputClass}>
                <option value="active">{t("productStatusActive")}</option>
                <option value="inactive">{t("productStatusInactive")}</option>
              </select>
            </label>

            {/* Image upload */}
            <div className="block md:col-span-2">
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

            {/* Description */}
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("productDescription")}</span>
              <textarea value={String(draft.description ?? "")} onChange={(e) => setField("description", e.target.value)} rows={3} className={`${inputClass} resize-y rounded-[1.5rem]`} placeholder={isRTL ? "תיאור המוצר" : "Product description"} />
            </label>

            {/* Notes */}
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("productNotesLabel")}</span>
              <textarea value={String(draft.notes ?? "")} onChange={(e) => setField("notes", e.target.value)} rows={2} className={`${inputClass} resize-y rounded-[1.5rem]`} placeholder={isRTL ? "הערות פנימיות" : "Internal notes"} />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => { void handleSave(); }} disabled={isBusy || uploadingImage} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60">
              {isBusy ? t("saving") : `${t("save")} ${isRTL ? "מוצר" : "Product"}`}
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

function ProductCard({
  product,
  clientName,
  isBusy,
  onEdit,
  onDelete,
  t,
}: {
  product: ProductDraft;
  clientName: string;
  isBusy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: import("@/lib/translations").TranslationKey) => string;
}) {
  const imageUrl = String(product.imageUrl ?? "");
  const price = Number(product.price ?? 0);
  const qty = Number(product.quantity ?? 0);
  const isActive = String(product.status ?? "active") === "active";

  return (
    <div className="flex flex-col rounded-[1.75rem] border border-slate-200 bg-white/90 shadow-[0_16px_60px_-40px_rgba(15,23,42,0.3)]">
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden rounded-t-[1.75rem] bg-slate-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={String(product.name ?? "")} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9H18" />
            </svg>
          </div>
        )}
        {!isActive ? (
          <span className="absolute right-2 top-2 rounded-full bg-slate-800/70 px-2 py-0.5 text-xs font-medium text-slate-200">{t("productStatusInactive")}</span>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h4 className="font-semibold text-slate-900">{String(product.name ?? "")}</h4>
        {String(product.category ?? "") ? (
          <p className="mt-0.5 text-xs text-teal-700">{String(product.category)}</p>
        ) : null}
        {clientName ? (
          <p className="mt-1 text-xs text-slate-500">{t("linkToClient")}: {clientName}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div>
            <p className="text-lg font-bold text-slate-900">₪{price.toFixed(2)}</p>
            <p className="text-xs text-slate-500">{t("quantityLabel")}: {qty}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onEdit} disabled={isBusy} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700">
              {t("edit")}
            </button>
            <button type="button" onClick={onDelete} disabled={isBusy} className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">
              {t("delete")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
