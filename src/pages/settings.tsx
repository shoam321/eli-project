import AppShell from "@/components/layout/AppShell";
import { exportWorkspaceState, useWorkspace } from "@/lib/workspace-data";

export default function SettingsPage() {
  const { isBusy, resetWorkspace, session, state } = useWorkspace();

  function handleExport() {
    const blob = new Blob([exportWorkspaceState(state)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ilab-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  async function handleReset() {
    if (!window.confirm("Reset all Supabase workspace records for the signed-in account?")) {
      return;
    }

    try {
      await resetWorkspace();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to reset the workspace.");
    }
  }

  const totalRecords = Object.values(state).reduce((sum, records) => sum + records.length, 0);

  return (
    <AppShell title="Settings & Recovery" subtitle="Control the authenticated web workspace now that the Supabase schema is live." activePath="/settings">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-[0_28px_100px_-52px_rgba(15,23,42,0.35)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-700">Backend Reality</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">The web workspace is now pointed at Supabase.</h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
            <p>
              The original mobile backend endpoint is still offline, but the restored web app can now read and write the business tables you provisioned through Supabase Auth and row-level security.
            </p>
            <p>
              Each signed-in account gets an isolated workspace through the `owner_user_id = auth.uid()` policies in the schema.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-[0_28px_100px_-52px_rgba(15,23,42,0.7)]">
          <p className="text-xs uppercase tracking-[0.26em] text-teal-300">Workspace Health</p>
          <div className="mt-5 grid gap-3 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-4">
              <span>Total synced records</span>
              <span className="text-lg font-semibold text-white">{totalRecords}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Custom REST backend</span>
              <span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-300">Offline</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Supabase public env</span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300">Available</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Business schema</span>
              <span className="rounded-full bg-sky-500/15 px-2 py-1 text-xs font-medium text-sky-300">Live</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Signed-in operator</span>
              <span className="truncate rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-white">
                {session?.user.email ?? "Unknown"}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-[0_28px_100px_-52px_rgba(15,23,42,0.35)] backdrop-blur xl:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Workspace Persistence</p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-900">Export or reset your Supabase-backed workspace</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                Export JSON Snapshot
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleReset();
                }}
                disabled={isBusy}
                className="rounded-full border border-rose-200 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                {isBusy ? "Resetting..." : "Reset Workspace"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
