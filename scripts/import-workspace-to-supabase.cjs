/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

function readEnvFile(filePath) {
  const env = {};

  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex);
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function getArgs() {
  const [, , userId, jsonPath] = process.argv;

  if (!userId || !jsonPath) {
    console.error("Usage: node scripts/import-workspace-to-supabase.cjs <auth-user-id> <workspace-json-path>");
    process.exit(1);
  }

  return { userId, jsonPath };
}

function readWorkspaceJson(jsonPath) {
  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

function mapClients(records, ownerUserId) {
  return records.map((record) => ({
    id: record.id,
    owner_user_id: ownerUserId,
    first_name: record.firstName || "",
    last_name: record.lastName || "",
    phone: record.phone || null,
    email: record.email || null,
    company: record.company || null,
    notes: record.notes || null,
    created_at: record.createdAt || new Date().toISOString(),
    updated_at: record.updatedAt || new Date().toISOString(),
  }));
}

function mapSuppliers(records, ownerUserId) {
  return records.map((record) => ({
    id: record.id,
    owner_user_id: ownerUserId,
    name: record.name || "",
    contact_name: record.contact || null,
    phone: record.phone || null,
    email: record.email || null,
    website: record.website || null,
    lead_time_days: record.leadTimeDays === "" ? null : Number(record.leadTimeDays || 0),
    notes: record.notes || null,
    created_at: record.createdAt || new Date().toISOString(),
    updated_at: record.updatedAt || new Date().toISOString(),
  }));
}

function mapBrands(records, ownerUserId) {
  return records.map((record) => ({
    id: record.id,
    owner_user_id: ownerUserId,
    name: record.name || "",
    active: Boolean(record.active),
    notes: record.notes || null,
    created_at: record.createdAt || new Date().toISOString(),
    updated_at: record.updatedAt || new Date().toISOString(),
  }));
}

function mapModels(records, ownerUserId) {
  return records.map((record) => ({
    id: record.id,
    owner_user_id: ownerUserId,
    brand_name: record.brand || null,
    name: record.name || "",
    active: Boolean(record.active),
    notes: record.notes || null,
    created_at: record.createdAt || new Date().toISOString(),
    updated_at: record.updatedAt || new Date().toISOString(),
  }));
}

function mapParts(records, ownerUserId) {
  return records.map((record) => ({
    id: record.id,
    owner_user_id: ownerUserId,
    supplier_name: record.supplier || null,
    name: record.name || "",
    brand_name: record.brand || null,
    model_name: record.model || null,
    serial_sku: record.serial || null,
    quantity: Number(record.quantity || 0),
    unit_price: Number(record.price || 0),
    notes: record.notes || null,
    created_at: record.createdAt || new Date().toISOString(),
    updated_at: record.updatedAt || new Date().toISOString(),
  }));
}

function mapDevices(records, ownerUserId) {
  return records.map((record) => ({
    id: record.id,
    owner_user_id: ownerUserId,
    brand_name: record.brand || "",
    model_name: record.model || "",
    serial_number: record.serialNumber || null,
    device_status: record.status || "client",
    owner_name: record.owner || null,
    notes: record.notes || null,
    created_at: record.createdAt || new Date().toISOString(),
    updated_at: record.updatedAt || new Date().toISOString(),
  }));
}

function mapProjects(records, ownerUserId) {
  return records.map((record) => ({
    id: record.id,
    owner_user_id: ownerUserId,
    customer_name: record.customerName || "",
    email: record.email || null,
    device_name: record.deviceName || "",
    serial_number: record.serialNumber || null,
    project_status: record.status || "open",
    due_date: record.dueDate || null,
    estimate: Number(record.estimate || 0),
    notes: record.notes || null,
    created_at: record.createdAt || new Date().toISOString(),
    updated_at: record.updatedAt || new Date().toISOString(),
  }));
}

function mapDraftProjects(records, ownerUserId) {
  return records.map((record) => ({
    id: record.id,
    owner_user_id: ownerUserId,
    customer_name: record.customerName || "",
    phone: record.phone || null,
    device_model: record.deviceModel || "",
    is_temporary: Boolean(record.isTemporary),
    quote_status: record.quoteStatus || "pending",
    notes: record.notes || null,
    created_at: record.createdAt || new Date().toISOString(),
    updated_at: record.updatedAt || new Date().toISOString(),
  }));
}

function mapOrders(records, ownerUserId) {
  return records.map((record) => ({
    id: record.id,
    owner_user_id: ownerUserId,
    order_number: record.orderNumber || "",
    supplier_name: record.supplier || null,
    order_status: record.status || "expected",
    expected_date: record.expectedDate || null,
    amount: Number(record.amount || 1),
    total_price: Number(record.price || 0),
    notes: record.notes || null,
    created_at: record.createdAt || new Date().toISOString(),
    updated_at: record.updatedAt || new Date().toISOString(),
  }));
}

function mapCashiers(records, ownerUserId) {
  return records.map((record) => ({
    id: record.id,
    owner_user_id: ownerUserId,
    item_name: record.itemName || "",
    item_type: record.itemType || "new",
    quantity: Number(record.quantity || 1),
    price: Number(record.price || 0),
    sold_at: record.soldAt || null,
    notes: record.notes || null,
    created_at: record.createdAt || new Date().toISOString(),
    updated_at: record.updatedAt || new Date().toISOString(),
  }));
}

async function upsertTable(supabase, table, rows) {
  if (!rows.length) {
    console.log(`${table}: skipped (no rows)`);
    return;
  }

  const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  console.log(`${table}: upserted ${rows.length}`);
}

async function main() {
  const env = readEnvFile(".env.local");
  const { userId, jsonPath } = getArgs();

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const workspace = readWorkspaceJson(jsonPath);
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  await upsertTable(supabase, "clients", mapClients(workspace.clients || [], userId));
  await upsertTable(supabase, "suppliers", mapSuppliers(workspace.suppliers || [], userId));
  await upsertTable(supabase, "brands", mapBrands(workspace.brands || [], userId));
  await upsertTable(supabase, "models", mapModels(workspace.models || [], userId));
  await upsertTable(supabase, "parts", mapParts(workspace.parts || [], userId));
  await upsertTable(supabase, "devices", mapDevices(workspace.devices || [], userId));
  await upsertTable(supabase, "projects", mapProjects(workspace.projects || [], userId));
  await upsertTable(supabase, "draft_projects", mapDraftProjects(workspace["draft-projects"] || [], userId));
  await upsertTable(supabase, "orders", mapOrders(workspace.orders || [], userId));
  await upsertTable(supabase, "cashiers", mapCashiers(workspace.cashiers || [], userId));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});