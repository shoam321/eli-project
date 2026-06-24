import AppShell from "@/components/layout/AppShell";
import OperationsDashboard from "@/components/operations/OperationsDashboard";

export default function Home() {
  return (
    <AppShell
      title="Operations Dashboard"
      subtitle="Restored product modules for projects, orders, clients, suppliers, inventory, devices, and cashier workflows."
      activePath="/"
    >
      <OperationsDashboard />
    </AppShell>
  );
}
