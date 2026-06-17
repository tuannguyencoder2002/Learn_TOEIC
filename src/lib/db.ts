import pg from "pg";

const { Pool } = pg;

declare global {
  // eslint-disable-next-line no-var
  var pgPool: pg.Pool | undefined;
  // eslint-disable-next-line no-var
  var defaultUserIdCache: string | undefined;
}

export function getPool(): pg.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("Thiếu DATABASE_URL trong .env.local");
  }

  if (!global.pgPool) {
    global.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    });
  }

  return global.pgPool;
}

export const DEFAULT_USERNAME = process.env.DEFAULT_USERNAME ?? "default";

/** @deprecated Dùng getDefaultUserId() — UUID được tạo ngẫu nhiên trong DB */
export const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID;

export async function getDefaultUserId(client?: pg.PoolClient): Promise<string> {
  if (process.env.DEFAULT_USER_ID) {
    return process.env.DEFAULT_USER_ID;
  }

  if (global.defaultUserIdCache) {
    return global.defaultUserIdCache;
  }

  const runner = client ?? getPool();
  const res = await runner.query<{ id: string }>(
    `SELECT id FROM users WHERE username = $1`,
    [DEFAULT_USERNAME]
  );

  const id = res.rows[0]?.id;
  if (!id) {
    throw new Error(
      `Không tìm thấy user "${DEFAULT_USERNAME}". Chạy setup-db.bat trước.`
    );
  }

  global.defaultUserIdCache = id;
  return id;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  return getPool().query<T>(text, params);
}

export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
