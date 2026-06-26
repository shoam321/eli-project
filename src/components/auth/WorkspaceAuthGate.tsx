import { useState, type FormEvent } from "react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/language-context";
import { useWorkspace } from "@/lib/workspace-data";

export default function WorkspaceAuthGate() {
  const { errorMessage, isBusy, refreshWorkspace, signIn, signUp, status } = useWorkspace();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    try {
      await signIn(email, password);
    } catch {
      return;
    }
  }

  async function handleSignUp() {
    setNotice(null);

    try {
      const result = await signUp(email, password);

      if (result === "confirm-email") {
        setNotice(t("confirmEmailNotice"));
        return;
      }

      setNotice(t("accountCreated"));
    } catch {
      return;
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(226,232,240,0.65),_transparent_28%),linear-gradient(135deg,_#f8f5ee_0%,_#edf7f6_52%,_#f4efe6_100%)] px-4 text-slate-900">
        <div className="w-full max-w-lg rounded-[2rem] border border-white/60 bg-white/86 p-8 text-center shadow-[0_32px_120px_-60px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="mb-4 flex justify-end">
            <LanguageSwitcher />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Supabase Workspace</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{t("preparingWorkspace")}</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {t("loadingSession")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(226,232,240,0.65),_transparent_28%),linear-gradient(135deg,_#f8f5ee_0%,_#edf7f6_52%,_#f4efe6_100%)] px-4 py-8 text-slate-900">
      <div className="w-full max-w-5xl space-y-4">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2.2rem] border border-slate-200 bg-slate-950/96 p-8 text-slate-100 shadow-[0_42px_130px_-70px_rgba(15,23,42,0.88)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">{t("brandName")}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">{t("workspaceTitle")}</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {t("workspaceSubtitle")}
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-4 rounded-full bg-white/5 px-4 py-3">
              <span>{t("supabaseSchema")}</span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300">{t("live")}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-full bg-white/5 px-4 py-3">
              <span>{t("accessModel")}</span>
              <span className="rounded-full bg-sky-500/15 px-2 py-1 text-xs font-medium text-sky-300">{t("authRequired")}</span>
            </div>
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-white/60 bg-white/86 p-8 shadow-[0_36px_130px_-72px_rgba(15,23,42,0.4)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">{t("accessWorkspace")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{t("signIn")}</h2>

          <form className="mt-8 space-y-4" onSubmit={handleSignIn}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("email")}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("password")}</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white"
                minLength={6}
                required
              />
            </label>

            {errorMessage ? (
              <p className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            {notice ? (
              <p className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {notice}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isBusy}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? t("working") : t("signIn")}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleSignUp();
                }}
                disabled={isBusy}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("signUp")}
              </button>
              <button
                type="button"
                onClick={() => {
                  void refreshWorkspace();
                }}
                disabled={isBusy}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Retry Connection
              </button>
            </div>
          </form>
        </section>
        </div>
      </div>
    </div>
  );
}