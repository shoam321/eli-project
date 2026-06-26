import AppShell from "@/components/layout/AppShell";
import ProductsPage from "@/components/operations/ProductsPage";
import { useLanguage } from "@/lib/language-context";

export default function ProductsRoute() {
  const { t } = useLanguage();

  return (
    <AppShell
      title={t("moduleProducts")}
      subtitle={t("moduleProductsSubtitle")}
      activePath="/products"
    >
      <ProductsPage />
    </AppShell>
  );
}
