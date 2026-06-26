import { useLanguage } from "@/lib/language-context";

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "he" : "en")}
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-teal-300 hover:bg-white hover:text-teal-700"
      aria-label="Switch language"
    >
      <span className="text-base leading-none">{lang === "en" ? "🇮🇱" : "🇬🇧"}</span>
      <span>{t("languageSwitcher")}</span>
    </button>
  );
}
