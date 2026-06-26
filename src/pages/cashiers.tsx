import AppShell from "@/components/layout/AppShell";
import CashierPage from "@/components/operations/CashierPage";
import { useLanguage } from "@/lib/language-context";

export default function CashiersRoute() {
  const { t } = useLanguage();

  return (
    <AppShell
      title={t("moduleCashier")}
      subtitle={t("moduleCashierSubtitle")}
      activePath="/cashiers"
    >
      <CashierPage />
    </AppShell>
  );
}
