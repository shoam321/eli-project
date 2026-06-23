import AppShell from "@/components/layout/AppShell";
import StatusCard from "@/components/dashboard/StatusCard";

export default function Home() {
  const supabaseReady =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <AppShell
      title="Operations Dashboard"
      subtitle="Starter shell for managing lab inventory, reservations, and usage analytics."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard
          title="Supabase Client"
          value={supabaseReady ? "Configured" : "Needs Setup"}
          description={
            supabaseReady
              ? "Environment variables are ready for browser-side requests."
              : "Copy .env.local.example to .env.local and add your Supabase keys."
          }
        />
        <StatusCard
          title="Stack"
          value="Next.js + TS"
          description="Pages Router with strict TypeScript settings and Tailwind CSS v4."
        />
        <StatusCard
          title="Next Step"
          value="Build Features"
          description="Add auth, instrument scheduling, and inventory modules in src/pages."
        />
      </section>
    </AppShell>
  );
}
