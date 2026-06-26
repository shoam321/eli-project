import { useLanguage } from "./language-context";
import { type ModuleDefinition, type ModuleSlug, getModuleDefinition } from "./module-config";

type FieldOverride = {
  label?: string;
  placeholder?: string;
  options?: Record<string, string>;
};

type ModuleOverride = {
  title: string;
  subtitle: string;
  description: string;
  emptyMessage: string;
  singular: string;
  fields: Record<string, FieldOverride>;
  columns: Record<string, string>;
};

const heOverrides: Record<ModuleSlug, ModuleOverride> = {
  products: {
    title: "מוצרים",
    subtitle: "קטלוג מוצרים עם תמונות ושיוך ללקוחות.",
    description: "ניהול קטלוג המוצרים, שיוך מוצרים ללקוחות ומעקב מלאי.",
    emptyMessage: "עדיין לא נשמרו מוצרים בסביבת העבודה.",
    singular: "מוצר",
    fields: {
      name: { label: "שם מוצר", placeholder: "שם המוצר" },
      category: { label: "קטגוריה", placeholder: "למשל: מסך, סוללה" },
      price: { label: "מחיר (₪)", placeholder: "0.00" },
      quantity: { label: "כמות", placeholder: "0" },
      imageUrl: { label: "תמונה" },
      clientId: { label: "לקוח משויך" },
      description: { label: "תיאור", placeholder: "תיאור המוצר" },
      notes: { label: "הערות פנימיות", placeholder: "הערות פנימיות" },
    },
    columns: { name: "מוצר", category: "קטגוריה", price: "מחיר", quantity: "כמות" },
  },
  projects: {
    title: "תיקונים",
    subtitle: "מעקב קליטה, תיקון ומסירה.",
    description: "ניהול הזמנות עבודה פעילות, תאריכי יעד ומעקב מכשיר לקוח.",
    emptyMessage: "עדיין לא נוצרו תיקונים בסביבת העבודה.",
    singular: "תיקון",
    fields: {
      customerName: { label: "לקוח", placeholder: "שם מלא של הלקוח" },
      email: { label: 'דוא"ל', placeholder: "customer@example.com" },
      deviceName: { label: "מכשיר", placeholder: "iPhone 14 Pro" },
      serialNumber: { label: "סריאלי / IMEI", placeholder: "סריאלי או IMEI" },
      status: { label: "סטטוס", options: { open: "פתוח", finished: "הושלם", canceled: "בוטל", delayed: "בהמתנה" } },
      dueDate: { label: "תאריך יעד" },
      notes: { label: "הערות", placeholder: "הערות תיקון, עבודה מובטחת, הערות לקוח" },
    },
    columns: { customerName: "לקוח", deviceName: "מכשיר", status: "סטטוס", dueDate: "יעד" },
  },
  "draft-projects": {
    title: "תיקונים בטיוטה",
    subtitle: "קליטות לא מאושרות והצעות מחיר ממתינות.",
    description: "שמירת רשומות קליטה ראשוניות לפני שהופכות לפרויקטים פעילים.",
    emptyMessage: "עדיין לא נשמרו תיקוני טיוטה בסביבת העבודה.",
    singular: "טיוטת תיקון",
    fields: {
      customerName: { label: "לקוח", placeholder: "שם מלא של הלקוח" },
      phone: { label: "טלפון", placeholder: "טלפון לקוח" },
      deviceModel: { label: "דגם מכשיר", placeholder: "דגם ממתין להצעת מחיר" },
      isTemporary: { label: "מכשיר זמני" },
      quoteStatus: {
        label: "סטטוס הצעה",
        options: { pending: "ממתין", "awaiting-approval": "ממתין לאישור", ready: "מוכן להמרה" },
      },
      notes: { label: "הערות", placeholder: "פרטי הצעה או הערות קליטה" },
    },
    columns: { customerName: "לקוח", deviceModel: "מכשיר", quoteStatus: "הצעה", isTemporary: "זמני" },
  },
  clients: {
    title: "לקוחות",
    subtitle: "רשומות לקוחות והיסטוריית קשר.",
    description: "מעקב אחר אנשים וחברות המחוברים לעבודות שירות והזמנות.",
    emptyMessage: "עדיין לא נשמרו לקוחות בסביבת העבודה.",
    singular: "לקוח",
    fields: {
      firstName: { label: "שם פרטי", placeholder: "שם פרטי" },
      lastName: { label: "שם משפחה", placeholder: "שם משפחה" },
      phone: { label: "טלפון", placeholder: "+972 50 000 0000" },
      email: { label: 'דוא"ל', placeholder: "client@example.com" },
      company: { label: "חברה", placeholder: "חברה או ארגון" },
      notes: { label: "הערות", placeholder: "העדפות לקוח או הערות פנימיות" },
    },
    columns: { firstName: "שם פרטי", lastName: "שם משפחה", phone: "טלפון", email: 'דוא"ל' },
  },
  suppliers: {
    title: "ספקים",
    subtitle: "ספקי חלקים ואנשי קשר לרכש.",
    description: "שמירת פרטי ספקים וערוצי ההתקשרות המועדפים.",
    emptyMessage: "עדיין לא נשמרו ספקים בסביבת העבודה.",
    singular: "ספק",
    fields: {
      name: { label: "ספק", placeholder: "שם ספק" },
      phone: { label: "טלפון", placeholder: "טלפון ספק" },
      email: { label: 'דוא"ל', placeholder: 'דוא"ל ספק' },
      website: { label: "אתר", placeholder: "https://supplier.example.com" },
      notes: { label: "הערות", placeholder: "זמני אספקה, מספרי חשבון, הערות תמחור" },
    },
    columns: { name: "ספק", phone: "טלפון", email: 'דוא"ל', website: "אתר" },
  },
  parts: {
    title: "חלקים",
    subtitle: "מלאי, תמחור ומקורות ספקים.",
    description: "ניהול חלקי חילוף, מלאי ורשימות ספקים במקום אחד.",
    emptyMessage: "עדיין לא נשמרו חלקים בסביבת העבודה.",
    singular: "חלק",
    fields: {
      name: { label: "שם חלק", placeholder: "מכלול מסך" },
      supplier: { label: "ספק", placeholder: "ספק מועדף" },
      model: { label: "דגם", placeholder: "דגם תואם" },
      serial: { label: "סריאלי / SKU", placeholder: "SKU פנימי או של הספק" },
      quantity: { label: "כמות", placeholder: "0" },
      price: { label: "מחיר יחידה", placeholder: "0.00" },
      notes: { label: "הערות", placeholder: "מדף אחסון, אחריות, הערות ספק" },
    },
    columns: { name: "חלק", supplier: "ספק", model: "דגם", quantity: "כמות" },
  },
  orders: {
    title: "הזמנות",
    subtitle: "צינור רכש וסטטוס קבלה.",
    description: "מעקב אחר הזמנות רכש, חלקים צפויים וקבלות ספקים.",
    emptyMessage: "עדיין לא נשמרו הזמנות בסביבת העבודה.",
    singular: "הזמנה",
    fields: {
      orderNumber: { label: "מספר הזמנה", placeholder: "PO-1024" },
      supplier: { label: "ספק", placeholder: "שם ספק" },
      status: { label: "סטטוס", options: { expected: "צפוי", received: "התקבל", missing: "חסר", canceled: "בוטל" } },
      expectedDate: { label: "תאריך צפוי" },
      amount: { label: "כמות", placeholder: "1" },
      price: { label: "מחיר כולל", placeholder: "0.00" },
      notes: { label: "הערות", placeholder: "מספר מעקב או הערות קבלה" },
    },
    columns: { orderNumber: "הזמנה", supplier: "ספק", status: "סטטוס", expectedDate: "צפוי" },
  },
  devices: {
    title: "מכשירים",
    subtitle: "מכשירי לקוח, זמניים וחברתיים.",
    description: "מעקב מכשירי קליטה, השאלות זמניות וחומרה פנימית.",
    emptyMessage: "עדיין לא נשמרו מכשירים בסביבת העבודה.",
    singular: "מכשיר",
    fields: {
      brand: { label: "מותג", placeholder: "Apple" },
      model: { label: "דגם", placeholder: "iPhone 14 Pro" },
      serialNumber: { label: "סריאלי / IMEI", placeholder: "סריאלי או IMEI" },
      status: { label: "סטטוס", options: { client: "לקוח", temporary: "זמני", own: "חברה", deleted: "נמחק" } },
      owner: { label: "בעלים", placeholder: "לקוח, חברה או מחזיק זמני" },
      imageUrl: { label: "תמונה" },
      notes: { label: "הערות", placeholder: "מצב, אביזרים, נעילה" },
    },
    columns: { brand: "מותג", model: "דגם", status: "סטטוס", owner: "בעלים" },
  },
  cashiers: {
    title: "קופה",
    subtitle: "נקודת מכירה והיסטוריית מכירות.",
    description: "תיעוד מכירות דלפק מהירות למכשירים ולחלקים.",
    emptyMessage: "עדיין לא נשמרו עסקאות קופה בסביבת העבודה.",
    singular: "עסקה",
    fields: {
      itemName: { label: "פריט", placeholder: "iPhone 12 משומש" },
      itemType: { label: "סוג", options: { new: "חדש", used: "משומש" } },
      quantity: { label: "כמות", placeholder: "1" },
      price: { label: "מחיר", placeholder: "0.00" },
      soldAt: { label: "נמכר ב" },
      notes: { label: "הערות", placeholder: "הערות קונה או אחריות" },
    },
    columns: { itemName: "פריט", itemType: "סוג", quantity: "כמות", price: "מחיר" },
  },
  brands: {
    title: "מותגים",
    subtitle: "קטלוג עיון לקליטה וחלקים.",
    description: "שמירת רשימת המותגים למכשירים ולחלקים לסנכרון עתידי.",
    emptyMessage: "עדיין לא נשמרו מותגים בסביבת העבודה.",
    singular: "מותג",
    fields: {
      name: { label: "מותג", placeholder: "Apple" },
      active: { label: "פעיל" },
      notes: { label: "הערות", placeholder: "ספק מועדף או הערות קטלוג" },
    },
    columns: { name: "מותג", active: "פעיל", updatedAt: "עודכן" },
  },
  models: {
    title: "דגמים",
    subtitle: "קטלוג דגמי מכשירים לפי מותג.",
    description: "ניהול רשימת דגמי המכשירים לשימוש בקליטה, חלקים ואוטומציות.",
    emptyMessage: "עדיין לא נשמרו דגמים בסביבת העבודה.",
    singular: "דגם",
    fields: {
      brand: { label: "מותג", placeholder: "Apple" },
      name: { label: "דגם", placeholder: "iPhone 14 Pro" },
      active: { label: "פעיל" },
      notes: { label: "הערות", placeholder: "תאימות או הערות קטלוג" },
    },
    columns: { brand: "מותג", name: "שם", active: "פעיל" },
  },
};

function applyOverrides(base: ModuleDefinition, overrides: ModuleOverride): ModuleDefinition {
  return {
    ...base,
    title: overrides.title,
    subtitle: overrides.subtitle,
    description: overrides.description,
    emptyMessage: overrides.emptyMessage,
    singular: overrides.singular,
    fields: base.fields.map((field) => {
      const fo = overrides.fields[field.key];
      if (!fo) return field;
      return {
        ...field,
        label: fo.label ?? field.label,
        placeholder: fo.placeholder ?? field.placeholder,
        options: field.options?.map((opt) => ({
          ...opt,
          label: fo.options?.[opt.value] ?? opt.label,
        })),
      };
    }),
    columns: base.columns.map((col) => ({
      ...col,
      label: overrides.columns[col.key] ?? col.label,
    })),
  };
}

export function useLocalizedModuleConfig(slug: string): ModuleDefinition | null {
  const { lang } = useLanguage();
  const base = getModuleDefinition(slug);
  if (!base) return null;

  if (lang === "he") {
    return applyOverrides(base, heOverrides[base.slug]);
  }

  return base;
}
