// Dong bo TOAN BO database learn_toeic giua cac may qua 1 thu muc chung
// (LAN / Google Drive / o cung). Tao file dump dang custom format (-Fc).
//
//   node scripts/db-sync.js export   -> dump DB hien tai ra <SYNC_DIR>
//   node scripts/db-sync.js import   -> nap dump tu <SYNC_DIR> de DB y het
//
// SYNC_DIR lay tu .env.local (bien SYNC_DIR=...), mac dinh ./db-snapshot

const fs = require("fs");
const path = require("path");
const { execSync, execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const envLocal = path.join(root, ".env.local");

function readEnvVar(name) {
  if (process.env[name]) return process.env[name];
  if (!fs.existsSync(envLocal)) return undefined;
  const text = fs.readFileSync(envLocal, "utf8");
  const m = text.match(new RegExp(`^${name}=(.+)$`, "m"));
  return m ? m[1].trim() : undefined;
}

function loadDatabaseUrl() {
  const url = readEnvVar("DATABASE_URL");
  if (!url) throw new Error("Thieu DATABASE_URL trong .env.local");
  return url;
}

// Tim thu muc bin cua PostgreSQL (chua psql/pg_dump/pg_restore)
function findPgBinDir() {
  const psqlPath = readEnvVar("PSQL_PATH");
  if (psqlPath && fs.existsSync(psqlPath)) {
    return path.dirname(psqlPath);
  }
  try {
    const out = execSync("where psql", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
    const first = out.split(/\r?\n/).find((l) => l.trim().toLowerCase().endsWith("psql.exe"));
    if (first) return path.dirname(first.trim());
  } catch {
    // fall through
  }
  for (const ver of ["15", "14", "16", "17"]) {
    const dir = `C:\\Program Files\\PostgreSQL\\${ver}\\bin`;
    if (fs.existsSync(path.join(dir, "psql.exe"))) return dir;
  }
  throw new Error(
    "Khong tim thay PostgreSQL bin (psql/pg_dump). Cai PostgreSQL, them vao PATH, hoac dat PSQL_PATH trong .env.local"
  );
}

function tool(binDir, name) {
  const exe = process.platform === "win32" ? `${name}.exe` : name;
  const full = path.join(binDir, exe);
  return fs.existsSync(full) ? full : exe; // fallback: trong cay PATH
}

const url = new URL(loadDatabaseUrl());
const dbName = url.pathname.replace(/^\//, "") || "learn_toeic";
const binDir = findPgBinDir();

const env = {
  ...process.env,
  PGPASSWORD: decodeURIComponent(url.password),
  PGHOST: url.hostname,
  PGPORT: url.port || "5432",
  PGUSER: decodeURIComponent(url.username),
  PGCLIENTENCODING: "UTF8",
};

const connArgs = ["-h", env.PGHOST, "-p", env.PGPORT, "-U", env.PGUSER];

function syncDir() {
  const dir = readEnvVar("SYNC_DIR") || path.join(root, "db-snapshot");
  const resolved = path.isAbsolute(dir) ? dir : path.join(root, dir);
  return resolved;
}

const dumpName = `${dbName}.dump`;
const metaName = `${dbName}.meta.txt`;

function psqlPostgres(sql) {
  return execFileSync(tool(binDir, "psql"), [...connArgs, "-d", "postgres", "-tAc", sql], {
    env,
    encoding: "utf8",
  }).trim();
}

function dbExists() {
  return psqlPostgres(`SELECT 1 FROM pg_database WHERE datname='${dbName}'`) === "1";
}

function doExport() {
  const dir = syncDir();
  fs.mkdirSync(dir, { recursive: true });
  const dumpPath = path.join(dir, dumpName);

  if (!dbExists()) {
    throw new Error(`Database ${dbName} chua ton tai tren may nay — khong co gi de export.`);
  }

  console.log(`> Dump ${dbName} -> ${dumpPath}`);
  execFileSync(
    tool(binDir, "pg_dump"),
    [...connArgs, "-d", dbName, "-Fc", "--no-owner", "--no-privileges", "-f", dumpPath],
    { env, stdio: "inherit" }
  );

  const sizeMb = (fs.statSync(dumpPath).size / 1024 / 1024).toFixed(2);
  const stamp = new Date().toISOString();
  fs.writeFileSync(
    path.join(dir, metaName),
    `db=${dbName}\nexported_at=${stamp}\nsize_mb=${sizeMb}\nfrom_host=${require("os").hostname()}\n`,
    "utf8"
  );

  console.log(`\nXONG! Da export ${sizeMb} MB luc ${stamp}`);
  console.log(`Thu muc chung: ${dir}`);
  console.log("Sang may khac, mo db-sync.bat -> chon [2] Import.");
}

function doImport() {
  const dir = syncDir();
  const dumpPath = path.join(dir, dumpName);
  if (!fs.existsSync(dumpPath)) {
    throw new Error(
      `Khong thay file dump: ${dumpPath}\n` +
        `Kiem tra SYNC_DIR trong .env.local tro dung thu muc chung (Google Drive/LAN) da co ${dumpName}.`
    );
  }

  const metaPath = path.join(dir, metaName);
  if (fs.existsSync(metaPath)) {
    console.log("> Snapshot:");
    process.stdout.write(
      fs.readFileSync(metaPath, "utf8").replace(/^/gm, "    ")
    );
  }

  // Tao moi DB cho sach de y HET snapshot (drop + create).
  if (dbExists()) {
    console.log(`> Ngat ket noi va xoa database ${dbName} cu...`);
    psqlPostgres(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity ` +
        `WHERE datname='${dbName}' AND pid<>pg_backend_pid()`
    );
    execFileSync(tool(binDir, "psql"), [...connArgs, "-d", "postgres", "-c", `DROP DATABASE IF EXISTS ${dbName}`], {
      env,
      stdio: "inherit",
    });
  }

  console.log(`> Tao database ${dbName} moi...`);
  execFileSync(
    tool(binDir, "psql"),
    [...connArgs, "-d", "postgres", "-c", `CREATE DATABASE ${dbName} WITH ENCODING 'UTF8' TEMPLATE template0`],
    { env, stdio: "inherit" }
  );

  console.log(`> Nap dump vao ${dbName}...`);
  execFileSync(
    tool(binDir, "pg_restore"),
    [...connArgs, "-d", dbName, "--no-owner", "--no-privileges", "--exit-on-error", dumpPath],
    { env, stdio: "inherit" }
  );

  console.log(`\nXONG! Database ${dbName} gio y HET ban tren may nguon.`);
  console.log("Chay start.bat de mo app.");
}

const mode = (process.argv[2] || "").toLowerCase();
try {
  console.log(`> PostgreSQL ${env.PGUSER}@${env.PGHOST}:${env.PGPORT} | db=${dbName}`);
  console.log(`> Thu muc chung (SYNC_DIR): ${syncDir()}\n`);
  if (mode === "export") doExport();
  else if (mode === "import") doImport();
  else {
    console.error('Dung: node scripts/db-sync.js [export|import]');
    process.exit(1);
  }
} catch (err) {
  console.error("\nLOI:", err.message);
  process.exit(1);
}
