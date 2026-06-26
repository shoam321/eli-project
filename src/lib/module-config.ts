export type ModuleSlug =
  | "products"
  | "projects"
  | "draft-projects"
  | "clients"
  | "suppliers"
  | "parts"
  | "orders"
  | "devices"
  | "cashiers"
  | "brands"
  | "models";

export type ModuleFieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "date"
  | "select"
  | "checkbox";

export type ModuleFieldOption = {
  label: string;
  value: string;
};

export type ModuleField = {
  key: string;
  label: string;
  type: ModuleFieldType;
  required?: boolean;
  placeholder?: string;
  options?: ModuleFieldOption[];
};

export type ModuleColumn = {
  key: string;
  label: string;
};

export type ModuleDefinition = {
  slug: ModuleSlug;
  title: string;
  subtitle: string;
  description: string;
  emptyMessage: string;
  singular: string;
  navGroup: "operations" | "reference";
  fields: ModuleField[];
  columns: ModuleColumn[];
};

const projectStatusOptions = [
  { label: "Open", value: "open" },
  { label: "Finished", value: "finished" },
  { label: "Canceled", value: "canceled" },
  { label: "Delayed", value: "delayed" },
];

const orderStatusOptions = [
  { label: "Expected", value: "expected" },
  { label: "Received", value: "received" },
  { label: "Missing", value: "missing" },
  { label: "Canceled", value: "canceled" },
];

const deviceStatusOptions = [
  { label: "Client", value: "client" },
  { label: "Temporary", value: "temporary" },
  { label: "Own", value: "own" },
  { label: "Deleted", value: "deleted" },
];

const cashierTypeOptions = [
  { label: "New", value: "new" },
  { label: "Used", value: "used" },
];

export const moduleOrder: ModuleSlug[] = [
  "projects",
  "draft-projects",
  "clients",
  "suppliers",
  "parts",
  "orders",
  "devices",
  "products",
  "cashiers",
  "brands",
  "models",
];

export const moduleDefinitions: Record<ModuleSlug, ModuleDefinition> = {
  "products": {
    slug: "products",
    title: "Products",
    subtitle: "Product catalog with images and client associations.",
    description: "Manage your product catalog, link products to clients, and track inventory.",
    emptyMessage: "No products are stored in the workspace yet.",
    singular: "Product",
    navGroup: "operations",
    fields: [
      { key: "name", label: "Product Name", type: "text", required: true, placeholder: "Product name" },
      { key: "category", label: "Category", type: "text", placeholder: "e.g. Screen, Battery" },
      { key: "price", label: "Price", type: "currency", required: true, placeholder: "0.00" },
      { key: "quantity", label: "Quantity", type: "number", placeholder: "0" },
      { key: "imageUrl", label: "Image URL", type: "text", placeholder: "" },
      { key: "clientId", label: "Linked Client", type: "text", placeholder: "" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Product description" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Internal notes" },
    ],
    columns: [
      { key: "name", label: "Product" },
      { key: "category", label: "Category" },
      { key: "price", label: "Price" },
      { key: "quantity", label: "Qty" },
    ],
  },
  "projects": {
    slug: "projects",
    title: "Projects",
    subtitle: "Repair, intake, and delivery tracking.",
    description: "Manage active work orders, due dates, and customer device progress.",
    emptyMessage: "No projects have been created in the web workspace yet.",
    singular: "Project",
    navGroup: "operations",
    fields: [
      { key: "customerName", label: "Customer", type: "text", required: true, placeholder: "Full customer name" },
      { key: "email", label: "Email", type: "text", placeholder: "customer@example.com" },
      { key: "deviceName", label: "Device", type: "text", required: true, placeholder: "iPhone 14 Pro" },
      { key: "serialNumber", label: "Serial / IMEI", type: "text", placeholder: "Serial or IMEI" },
      { key: "status", label: "Status", type: "select", required: true, options: projectStatusOptions },
      { key: "dueDate", label: "Due Date", type: "date" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Repair notes, promised work, customer comments" },
    ],
    columns: [
      { key: "customerName", label: "Customer" },
      { key: "deviceName", label: "Device" },
      { key: "status", label: "Status" },
      { key: "dueDate", label: "Due" },
    ],
  },
  "draft-projects": {
    slug: "draft-projects",
    title: "Draft Projects",
    subtitle: "Unconfirmed intake and pending estimates.",
    description: "Hold early intake records before they become fully active projects.",
    emptyMessage: "No draft projects are stored in the web workspace yet.",
    singular: "Draft Project",
    navGroup: "operations",
    fields: [
      { key: "customerName", label: "Customer", type: "text", required: true, placeholder: "Full customer name" },
      { key: "phone", label: "Phone", type: "text", placeholder: "Customer phone" },
      { key: "deviceModel", label: "Device Model", type: "text", required: true, placeholder: "Model awaiting quote" },
      { key: "isTemporary", label: "Temporary Device", type: "checkbox" },
      { key: "quoteStatus", label: "Quote Status", type: "select", required: true, options: [
        { label: "Pending", value: "pending" },
        { label: "Awaiting Approval", value: "awaiting-approval" },
        { label: "Ready to Convert", value: "ready" },
      ] },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Estimate details or intake notes" },
    ],
    columns: [
      { key: "customerName", label: "Customer" },
      { key: "deviceModel", label: "Device" },
      { key: "quoteStatus", label: "Quote" },
      { key: "isTemporary", label: "Temporary" },
    ],
  },
  "clients": {
    slug: "clients",
    title: "Clients",
    subtitle: "Customer records and contact history.",
    description: "Track the people and companies tied to service work and orders.",
    emptyMessage: "No clients are stored in the web workspace yet.",
    singular: "Client",
    navGroup: "operations",
    fields: [
      { key: "firstName", label: "First Name", type: "text", required: true, placeholder: "First name" },
      { key: "lastName", label: "Last Name", type: "text", required: true, placeholder: "Last name" },
      { key: "phone", label: "Phone", type: "text", placeholder: "+1 555 0100" },
      { key: "email", label: "Email", type: "text", placeholder: "client@example.com" },
      { key: "company", label: "Company", type: "text", placeholder: "Company or organization" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Customer preferences or internal notes" },
    ],
    columns: [
      { key: "firstName", label: "First" },
      { key: "lastName", label: "Last" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
    ],
  },
  "suppliers": {
    slug: "suppliers",
    title: "Suppliers",
    subtitle: "Parts vendors and purchasing contacts.",
    description: "Store the vendors you order from and their preferred channels.",
    emptyMessage: "No suppliers are stored in the web workspace yet.",
    singular: "Supplier",
    navGroup: "operations",
    fields: [
      { key: "name", label: "Supplier", type: "text", required: true, placeholder: "Supplier name" },
      { key: "phone", label: "Phone", type: "text", placeholder: "Supplier phone" },
      { key: "email", label: "Email", type: "text", placeholder: "Supplier email" },
      { key: "website", label: "Website", type: "text", placeholder: "https://supplier.example.com" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Lead times, account numbers, pricing notes" },
    ],
    columns: [
      { key: "name", label: "Supplier" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "website", label: "Website" },
    ],
  },
  "parts": {
    slug: "parts",
    title: "Parts",
    subtitle: "Inventory, pricing, and supplier sourcing.",
    description: "Keep replacement parts, stock levels, and supplier references in one place.",
    emptyMessage: "No parts are stored in the web workspace yet.",
    singular: "Part",
    navGroup: "operations",
    fields: [
      { key: "name", label: "Part Name", type: "text", required: true, placeholder: "Screen assembly" },
      { key: "supplier", label: "Supplier", type: "text", placeholder: "Preferred supplier" },
      { key: "model", label: "Model", type: "text", placeholder: "Compatible model" },
      { key: "serial", label: "Serial / SKU", type: "text", placeholder: "Internal or vendor SKU" },
      { key: "quantity", label: "Quantity", type: "number", required: true, placeholder: "0" },
      { key: "price", label: "Unit Price", type: "currency", placeholder: "0.00" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Storage bin, warranty, sourcing notes" },
    ],
    columns: [
      { key: "name", label: "Part" },
      { key: "supplier", label: "Supplier" },
      { key: "model", label: "Model" },
      { key: "quantity", label: "Qty" },
    ],
  },
  "orders": {
    slug: "orders",
    title: "Orders",
    subtitle: "Purchasing pipeline and receiving status.",
    description: "Track purchase orders, expected parts, and supplier receipts.",
    emptyMessage: "No orders are stored in the web workspace yet.",
    singular: "Order",
    navGroup: "operations",
    fields: [
      { key: "orderNumber", label: "Order Number", type: "text", required: true, placeholder: "PO-1024" },
      { key: "supplier", label: "Supplier", type: "text", required: true, placeholder: "Supplier name" },
      { key: "status", label: "Status", type: "select", required: true, options: orderStatusOptions },
      { key: "expectedDate", label: "Expected Date", type: "date" },
      { key: "amount", label: "Quantity", type: "number", placeholder: "1" },
      { key: "price", label: "Total Price", type: "currency", placeholder: "0.00" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Tracking number or receiving notes" },
    ],
    columns: [
      { key: "orderNumber", label: "Order" },
      { key: "supplier", label: "Supplier" },
      { key: "status", label: "Status" },
      { key: "expectedDate", label: "Expected" },
    ],
  },
  "devices": {
    slug: "devices",
    title: "Devices",
    subtitle: "Customer, temporary, and company devices.",
    description: "Track intake devices, temporary loaners, and internal hardware.",
    emptyMessage: "No devices are stored in the web workspace yet.",
    singular: "Device",
    navGroup: "operations",
    fields: [
      { key: "brand", label: "Brand", type: "text", required: true, placeholder: "Apple" },
      { key: "model", label: "Model", type: "text", required: true, placeholder: "iPhone 14 Pro" },
      { key: "serialNumber", label: "Serial / IMEI", type: "text", placeholder: "Serial or IMEI" },
      { key: "status", label: "Status", type: "select", required: true, options: deviceStatusOptions },
      { key: "owner", label: "Owner", type: "text", placeholder: "Client, company, or temporary holder" },
      { key: "imageUrl", label: "Image URL", type: "text", placeholder: "" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Condition, accessories, lock state" },
    ],
    columns: [
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "status", label: "Status" },
      { key: "owner", label: "Owner" },
    ],
  },
  "cashiers": {
    slug: "cashiers",
    title: "Cashier",
    subtitle: "Point-of-sale and sales history workspace.",
    description: "Record quick counter sales for devices and parts while the backend migration is offline.",
    emptyMessage: "No cashier entries are stored in the web workspace yet.",
    singular: "Cashier Entry",
    navGroup: "operations",
    fields: [
      { key: "itemName", label: "Item", type: "text", required: true, placeholder: "Used iPhone 12" },
      { key: "itemType", label: "Type", type: "select", required: true, options: cashierTypeOptions },
      { key: "quantity", label: "Quantity", type: "number", placeholder: "1" },
      { key: "price", label: "Price", type: "currency", required: true, placeholder: "0.00" },
      { key: "soldAt", label: "Sold At", type: "date" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Buyer notes or warranty comments" },
    ],
    columns: [
      { key: "itemName", label: "Item" },
      { key: "itemType", label: "Type" },
      { key: "quantity", label: "Qty" },
      { key: "price", label: "Price" },
    ],
  },
  "brands": {
    slug: "brands",
    title: "Brands",
    subtitle: "Reference catalog for intake and parts.",
    description: "Keep the device and part brand list ready for future backend sync.",
    emptyMessage: "No brands are stored in the web workspace yet.",
    singular: "Brand",
    navGroup: "reference",
    fields: [
      { key: "name", label: "Brand", type: "text", required: true, placeholder: "Apple" },
      { key: "active", label: "Active", type: "checkbox" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Preferred vendor or catalog notes" },
    ],
    columns: [
      { key: "name", label: "Brand" },
      { key: "active", label: "Active" },
      { key: "updatedAt", label: "Updated" },
    ],
  },
  "models": {
    slug: "models",
    title: "Models",
    subtitle: "Reference catalog for supported hardware.",
    description: "Manage the device model list used by intake, parts, and future automations.",
    emptyMessage: "No models are stored in the web workspace yet.",
    singular: "Model",
    navGroup: "reference",
    fields: [
      { key: "brand", label: "Brand", type: "text", required: true, placeholder: "Apple" },
      { key: "name", label: "Model", type: "text", required: true, placeholder: "iPhone 14 Pro" },
      { key: "active", label: "Active", type: "checkbox" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Compatibility or catalog notes" },
    ],
    columns: [
      { key: "brand", label: "Brand" },
      { key: "name", label: "Model" },
      { key: "active", label: "Active" },
    ],
  },
};

export function getModuleDefinition(slug: string): ModuleDefinition | null {
  if (!slug || !(slug in moduleDefinitions)) {
    return null;
  }

  return moduleDefinitions[slug as ModuleSlug];
}
