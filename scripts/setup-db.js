const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const envLocal = path.join(root, ".env.local");
const envExample = path.join(root, ".env.example");

function ensureEnvLocal() {
  if (fs.existsSync(envLocal)) return;
  if (!fs.existsSync(envExample)) {
    throw new Error("Thiếu .env.example — không tạo được .env.local");
  }
  fs.copyFileSync(envExample, envLocal);
  console.log("> Đã tạo .env.local từ .env.example");
}

function loadDatabaseUrl() {
  ensureEnvLocal();
  const envText = fs.readFileSync(envLocal, "utf8");
  const urlMatch = envText.match(/^DATABASE_URL=(.+)$/m);
  if (!urlMatch) throw new Error("Thiếu DATABASE_URL trong .env.local");
  return urlMatch[1].trim();
}

function findPsql() {
  if (process.env.PSQL_PATH && fs.existsSync(process.env.PSQL_PATH)) {
    return process.env.PSQL_PATH;
  }

  try {
    const out = execSync("where psql", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
    const first = out.split(/\r?\n/).find((l) => l.trim().endsWith("psql.exe"));
    if (first) return first.trim();
  } catch {
    // fall through
  }

  for (const ver of ["17", "16", "15", "14"]) {
    const candidate = `C:\\Program Files\\PostgreSQL\\${ver}\\bin\\psql.exe`;
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(
    "Không tìm thấy psql.exe. Cài PostgreSQL hoặc thêm vào PATH, hoặc đặt PSQL_PATH trong .env.local"
  );
}

const url = new URL(loadDatabaseUrl());
const psql = findPsql();
const dbName = url.pathname.replace(/^\//, "") || "learn_toeic";

const env = {
  ...process.env,
  PGPASSWORD: decodeURIComponent(url.password),
  PGHOST: url.hostname,
  PGPORT: url.port || "5432",
  PGUSER: decodeURIComponent(url.username),
  PGCLIENTENCODING: "UTF8",
};

function psqlCmd(database, args) {
  return `"${psql}" -h ${env.PGHOST} -p ${env.PGPORT} -U ${env.PGUSER} -d ${database} ${args}`;
}

function runSql(database, file) {
  const filePath = path.join(root, file);
  console.log(">", file);
  execSync(psqlCmd(database, `-v ON_ERROR_STOP=1 -f "${filePath}"`), {
    env,
    stdio: "inherit",
    cwd: root,
  });
}

function dbExists() {
  const out = execSync(
    psqlCmd("postgres", `-tAc "SELECT 1 FROM pg_database WHERE datname='${dbName}'"`),
    { env, encoding: "utf8" }
  );
  return out.trim() === "1";
}

try {
  console.log(`> PostgreSQL ${env.PGUSER}@${env.PGHOST}:${env.PGPORT}`);

  if (!dbExists()) {
    console.log(`> Tạo database ${dbName}...`);
    execSync(
      psqlCmd("postgres", `-c "CREATE DATABASE ${dbName} WITH ENCODING 'UTF8' TEMPLATE template0"`),
      { env, stdio: "inherit" }
    );
  } else {
    console.log(`> Database ${dbName} đã tồn tại, bỏ qua bước tạo.`);
  }

  runSql(dbName, "database\\001_schema.sql");
  runSql(dbName, "database\\003_constraints.sql");
  runSql(dbName, "database\\004_parts_6_7.sql");
  runSql(dbName, "database\\005_saved_words.sql");
  runSql(dbName, "database\\002_seed.sql");

  console.log("\nSetup HOÀN TẤT! Database learn_toeic sẵn sàng.");
  console.log("Chạy start.bat để mở app.");
} catch (err) {
  console.error("\nSetup LỖI:", err.message);
  process.exit(1);
}
