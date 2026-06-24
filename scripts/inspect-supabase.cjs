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

async function main() {
  const env = readEnvFile(".env.local");
  const mode = process.argv[2] || "tables";

  if (mode === "env") {
    console.log(`URL_SET=${Boolean(env.NEXT_PUBLIC_SUPABASE_URL)}`);
    console.log(`ANON_SET=${Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY)}`);
    console.log(`SERVICE_SET=${Boolean(env.SUPABASE_SERVICE_ROLE_KEY)}`);
    console.log(`URL_PREFIX=${String(env.NEXT_PUBLIC_SUPABASE_URL || "").slice(0, 8)}`);
    return;
  }

  const key =
    mode === "auth"
      ? env.SUPABASE_SERVICE_ROLE_KEY
      : env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  if (mode === "auth") {
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log("auth.users ERROR missing service role key");
      process.exitCode = 1;
      return;
    }

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log(`auth.users ERROR ${error.message}`);
      process.exitCode = 1;
      return;
    }

    console.log(`auth.users OK count=${data.users.length}`);
    return;
  }

  if (mode === "sample") {
    const tables = process.argv.slice(3);

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        console.log(`${table}: ERROR ${error.message}`);
        continue;
      }

      if (!data || data.length === 0) {
        console.log(`${table}: EMPTY`);
        continue;
      }

      console.log(`${table}: COLUMNS ${Object.keys(data[0]).join(",")}`);
      console.log(`${table}: SAMPLE ${JSON.stringify(data[0])}`);
    }

    return;
  }

  if (mode === "openapi") {
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        Accept: "application/openapi+json",
      },
    });

    if (!response.ok) {
      console.log(`openapi ERROR status=${response.status}`);
      process.exitCode = 1;
      return;
    }

    const document = await response.json();
    const paths = Object.keys(document.paths || {});

    for (const path of paths) {
      console.log(path);
    }

    return;
  }

  const tables = [
    "users",
    "clients",
    "orders",
    "order_parts",
    "parts",
    "suppliers",
    "cashiers",
    "transactions",
    "projects",
    "devices",
    "brands",
    "models",
    "draft_projects",
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log(`${table}: ERROR ${error.message}`);
      continue;
    }

    console.log(`${table}: OK count=${count}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});