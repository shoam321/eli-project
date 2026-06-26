import { useState, useMemo, type FormEvent } from "react";

import { useLanguage } from "@/lib/language-context";
import type { HypPaymentResult } from "@/lib/hyp-payment";
import {
  buildDefaultDraft,
  filterWorkspaceRecords,
  useWorkspace,
  useWorkspaceState,
  type WorkspaceRecord,
} from "@/lib/workspace-data";

type CashierEntry = WorkspaceRecord;

const cashierTypeOptions = [
  { value: "new", labelEn: "New", labelHe: "חדש" },
  { value: "used", labelEn: "Used", labelHe: "משומש" },
];

export default function CashierPage() {
  const { deleteRecord, isBusy, saveRecord } = useWorkspace();
  const workspaceState = useWorkspaceState();
  const { t, lang } = useLanguage();

  const entries = workspaceState["cashiers"];
  const isRTL = lang === "he";

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<CashierEntry | null>(null);
  const [paymentEntry, setPaymentEntry] = useState<CashierEntry | null>(null);

  const filtered = useMemo(() => filterWorkspaceRecords(entries, query), [entries, query]);

  function openCreate() {
    setDraft(buildDefaultDraft("cashiers"));
  }

  function openEdit(entry: CashierEntry) {
    setDraft({ ...entry });
  }

  function closeForm() {
    setDraft(null);
  }

  function setField(key: string, value: string) {
    if (!draft) return;
    setDraft({ ...draft, [key]: value });
  }

  async function handleSave() {
    if (!draft) return;
    if (!String(draft.itemName ?? "").trim()) {
      window.alert(`${isRTL ? "שם פריט" : "Item"}${t("fieldRequiredSuffix")}`);
      return;
    }
    try {
      await saveRecord("cashiers", draft);
      closeForm();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t("unableToSave"));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("deleteRecordConfirm"))) return;
    try {
      await deleteRecord("cashiers", id);
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
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{t("moduleCashier")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t("moduleCashierDesc")}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.75)]">
          <p className="text-xs uppercase tracking-[0.26em] text-teal-300">{t("workspaceStats")}</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-4">
              <span>{t("storedRecords")}</span>
              <span className="text-lg font-semibold text-white">{entries.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>{t("visibleAfterFilter")}</span>
              <span className="text-lg font-semibold text-white">{filtered.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>{t("persistenceMode")}</span>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-teal-200">{t("supabaseWorkspace")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search + add + payment */}
      <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.42)] backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2 md:max-w-xl">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{t("searchRecords")}</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`${t("search")}...`} className={inputClass} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={openCreate} disabled={isBusy} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
              {t("add")} {isRTL ? "עסקה" : "Entry"}
            </button>
            <button type="button" onClick={() => setPaymentEntry({ id: "", createdAt: "", updatedAt: "", itemName: "", itemType: "new", quantity: 1, price: "", soldAt: "", notes: "" })} className="rounded-full border border-teal-200 bg-teal-50 px-5 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-100">
              {t("processPayment")}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{isRTL ? "פריט" : "Item"}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{isRTL ? "סוג" : "Type"}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{isRTL ? "כמות" : "Qty"}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{isRTL ? "מחיר" : "Price"}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      {entries.length === 0 ? t("moduleCashierDesc") : `${t("search")}: "${query}"`}
                    </td>
                  </tr>
                ) : (
                  filtered.map((entry) => {
                    const typeObj = cashierTypeOptions.find((o) => o.value === entry.itemType);
                    const typeLabel = typeObj ? (isRTL ? typeObj.labelHe : typeObj.labelEn) : String(entry.itemType ?? "");
                    return (
                      <tr key={entry.id} className="align-top">
                        <td className="px-4 py-4 text-sm text-slate-700">{String(entry.itemName ?? "")}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">{typeLabel}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">{String(entry.quantity ?? "")}</td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">₪{Number(entry.price ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => openEdit(entry)} disabled={isBusy} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700">
                              {t("edit")}
                            </button>
                            <button type="button" onClick={() => setPaymentEntry(entry)} className="rounded-full border border-teal-200 px-3 py-1.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-50">
                              {isRTL ? "גבה" : "Pay"}
                            </button>
                            <button type="button" onClick={() => { void handleDelete(entry.id); }} disabled={isBusy} className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">
                              {t("delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Edit / create form */}
      {draft ? (
        <section className="rounded-[2rem] border border-teal-200 bg-white/90 p-6 shadow-[0_24px_90px_-54px_rgba(13,148,136,0.42)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-700">{t("recordEditor")}</p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-900">
                {entries.some((e) => e.id === draft.id)
                  ? `${t("editRecord")} ${isRTL ? "עסקה" : "Entry"}`
                  : `${t("addRecord")} ${isRTL ? "עסקה" : "Entry"}`}
              </h3>
            </div>
            <button type="button" onClick={closeForm} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300">
              {t("close")}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{isRTL ? "פריט *" : "Item *"}</span>
              <input type="text" value={String(draft.itemName ?? "")} onChange={(e) => setField("itemName", e.target.value)} className={inputClass} placeholder={isRTL ? "iPhone 12 משומש" : "Used iPhone 12"} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{isRTL ? "סוג" : "Type"}</span>
              <select value={String(draft.itemType ?? "new")} onChange={(e) => setField("itemType", e.target.value)} className={inputClass}>
                {cashierTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{isRTL ? o.labelHe : o.labelEn}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{isRTL ? "כמות" : "Quantity"}</span>
              <input type="number" min="1" value={String(draft.quantity ?? "1")} onChange={(e) => setField("quantity", e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{isRTL ? "מחיר (₪) *" : "Price (₪) *"}</span>
              <input type="number" step="0.01" min="0" value={String(draft.price ?? "")} onChange={(e) => setField("price", e.target.value)} className={inputClass} placeholder="0.00" required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{isRTL ? "תאריך מכירה" : "Sold At"}</span>
              <input type="date" value={String(draft.soldAt ?? "")} onChange={(e) => setField("soldAt", e.target.value)} className={inputClass} />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">{isRTL ? "הערות" : "Notes"}</span>
              <textarea value={String(draft.notes ?? "")} onChange={(e) => setField("notes", e.target.value)} rows={2} className={`${inputClass} resize-y rounded-[1.5rem]`} />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => { void handleSave(); }} disabled={isBusy} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60">
              {isBusy ? t("saving") : `${t("save")} ${isRTL ? "עסקה" : "Entry"}`}
            </button>
            <button type="button" onClick={closeForm} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
              {t("cancel")}
            </button>
          </div>
        </section>
      ) : null}

      {/* Payment modal */}
      {paymentEntry !== null ? (
        <PaymentModal
          entry={paymentEntry}
          isRTL={isRTL}
          t={t}
          onClose={() => setPaymentEntry(null)}
        />
      ) : null}
    </div>
  );
}

function PaymentModal({
  entry,
  isRTL,
  t,
  onClose,
}: {
  entry: CashierEntry;
  isRTL: boolean;
  t: (key: import("@/lib/translations").TranslationKey) => string;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(String(entry.price ?? ""));
  const [description, setDescription] = useState(String(entry.itemName ?? ""));
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<HypPaymentResult | null>(null);

  async function handlePay(e: FormEvent) {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) return;

    setBusy(true);
    setResult(null);

    try {
      const res = await fetch("/api/payments/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          description: description.trim() || (isRTL ? "תשלום" : "Payment"),
          orderId: entry.id || crypto.randomUUID(),
          customerPhone: phone.trim() || undefined,
        }),
      });

      const data = (await res.json()) as HypPaymentResult;
      setResult(data);

      if (data.status === "ok") {
        window.open(data.paymentUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setResult({ status: "error", message: err instanceof Error ? err.message : t("paymentError") });
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white p-8 shadow-[0_40px_140px_-60px_rgba(15,23,42,0.6)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">{t("hypPayment")}</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">{t("paymentModal")}</h3>
          </div>
          <button type="button" onClick={onClose} className="mt-1 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300">
            {t("close")}
          </button>
        </div>

        <form onSubmit={(e) => { void handlePay(e); }} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{t("paymentAmount")}</span>
            <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{t("paymentDescription")}</span>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{t("paymentPhone")}</span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder={isRTL ? "0501234567" : "050-123-4567"} />
          </label>

          {result ? (
            <div className={`rounded-[1.4rem] border px-4 py-3 text-sm ${
              result.status === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" :
              result.status === "pending" ? "border-amber-200 bg-amber-50 text-amber-800" :
              "border-rose-200 bg-rose-50 text-rose-700"
            }`}>
              {result.status === "ok" && t("paymentSuccess")}
              {result.status === "pending" && t("paymentPending")}
              {result.status === "error" && result.message}
            </div>
          ) : null}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={busy} className="flex-1 rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60">
              {busy ? (isRTL ? "...מעבד" : "Processing...") : t("initiatePayment")}
            </button>
            <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
