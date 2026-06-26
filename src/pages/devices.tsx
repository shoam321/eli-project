import AppShell from "@/components/layout/AppShell";
import DevicesPage from "@/components/operations/DevicesPage";
import { useLanguage } from "@/lib/language-context";

export default function DevicesRoute() {
  const { t } = useLanguage();

  return (
    <AppShell
      title={t("moduleDevices")}
      subtitle={t("moduleDevicesSubtitle")}
      activePath="/devices"
    >
      <DevicesPage />
    </AppShell>
  );
}
