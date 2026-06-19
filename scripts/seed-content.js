/**
 * Nap kho de Part 5/6/7 (tu soan trong scripts/data/*.json) vao Postgres.
 * Idempotent: chay lai nhieu lan se KHONG tao trung — Part 5 bo qua cau co cung
 * sentence, Part 6/7 bo qua passage co cung title. Co the them de moi roi chay lai.
 *
 *   node scripts/seed-content.js
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const root = path.join(__dirname, "..");
const dataDir = path.join(__dirname, "data");

function loadDatabaseUrl() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) throw new Error("Thiếu .env.local");
  const text = fs.readFileSync(envPath, "utf8");
  const m = text.match(/^DATABASE_URL=(.+)$/m);
  if (!m) throw new Error("Thiếu DATABASE_URL trong .env.local");
  return m[1].trim();
}

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8"));
}

async function getDefaultUserId(client) {
  const res = await client.query(
    "SELECT id FROM users WHERE username = 'default' LIMIT 1"
  );
  if (!res.rows[0]) throw new Error("Chưa có user 'default' — chạy setup-db trước.");
  return res.rows[0].id;
}

/** Tim hoac tao exercise_set theo (title, part). */
async function findOrCreateSet(client, userId, title, part) {
  const found = await client.query(
    "SELECT id FROM exercise_sets WHERE title = $1 AND part_number = $2 LIMIT 1",
    [title, part]
  );
  if (found.rows[0]) return found.rows[0].id;

  const res = await client.query(
    `INSERT INTO exercise_sets (user_id, title, source_type, part_number, category, question_count)
     VALUES ($1, $2, 'manual', $3, 'mixed', 0) RETURNING id`,
    [userId, title, part]
  );
  return res.rows[0].id;
}

async function nextSortOrder(client, setId) {
  const res = await client.query(
    "SELECT COALESCE(MAX(sort_order), 0) AS m FROM questions WHERE exercise_set_id = $1",
    [setId]
  );
  return Number(res.rows[0].m) + 1;
}

async function insertVocab(client, questionId, vocab) {
  for (const v of vocab || []) {
    const word = String(v.word || "").trim();
    if (!word) continue;
    const normalized = word.toLowerCase();
    const pos = v.type || null;
    const existing = await client.query(
      `SELECT id FROM vocabulary
       WHERE word_normalized = $1 AND COALESCE(part_of_speech, '') = COALESCE($2, '')`,
      [normalized, pos]
    );
    let vocabId = existing.rows[0] && existing.rows[0].id;
    if (!vocabId) {
      const ins = await client.query(
        `INSERT INTO vocabulary (word, word_normalized, meaning_vi, part_of_speech, example_en)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [word, normalized, v.meaning || "", pos, v.example || null]
      );
      vocabId = ins.rows[0].id;
    }
    await client.query(
      `INSERT INTO question_vocabulary (question_id, vocabulary_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [questionId, vocabId]
    );
  }
}

async function insertQuestion(client, userId, setId, part, sortOrder, q, passageId) {
  const res = await client.query(
    `INSERT INTO questions
       (exercise_set_id, passage_id, part_number, sort_order, sentence, question_text,
        correct_index, category, topic, explanation_en, explanation_vi)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id`,
    [
      setId,
      passageId,
      part,
      sortOrder,
      q.sentence || q.questionText || "",
      q.questionText || null,
      q.correctIndex,
      q.category,
      q.topic || null,
      q.explanation || null,
      q.explanationVi || null,
    ]
  );
  const questionId = res.rows[0].id;

  for (let j = 0; j < q.options.length; j++) {
    await client.query(
      `INSERT INTO question_options (question_id, option_index, option_text)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [questionId, j, q.options[j]]
    );
  }

  await insertVocab(client, questionId, q.vocab);

  await client.query(
    `INSERT INTO user_question_progress (user_id, question_id, next_review_at, mastery_level)
     VALUES ($1, $2, NOW(), 0) ON CONFLICT (user_id, question_id) DO NOTHING`,
    [userId, questionId]
  );
  return questionId;
}

async function seedPart5(client, userId) {
  const data = readJson("part5.json");
  const setId = await findOrCreateSet(client, userId, data.setTitle, 5);

  const existing = await client.query(
    "SELECT sentence FROM questions WHERE exercise_set_id = $1",
    [setId]
  );
  const seen = new Set(existing.rows.map((r) => r.sentence));

  let added = 0;
  let sort = await nextSortOrder(client, setId);
  for (const q of data.questions) {
    if (seen.has(q.sentence)) continue;
    await insertQuestion(client, userId, setId, 5, sort++, q, null);
    added++;
  }
  await client.query(
    "UPDATE exercise_sets SET question_count = (SELECT COUNT(*) FROM questions WHERE exercise_set_id = $1) WHERE id = $1",
    [setId]
  );
  return added;
}

async function seedPassagePart(client, userId, fileName, part) {
  const data = readJson(fileName);
  const setId = await findOrCreateSet(client, userId, data.setTitle, part);

  const existingP = await client.query(
    "SELECT title FROM passages WHERE exercise_set_id = $1",
    [setId]
  );
  const seenTitles = new Set(existingP.rows.map((r) => r.title));

  let addedQ = 0;
  let pOrder = (
    await client.query(
      "SELECT COALESCE(MAX(sort_order), 0) AS m FROM passages WHERE exercise_set_id = $1",
      [setId]
    )
  ).rows[0].m;
  pOrder = Number(pOrder);

  let sort = await nextSortOrder(client, setId);

  for (const p of data.passages) {
    if (seenTitles.has(p.title)) continue;
    pOrder++;
    const pres = await client.query(
      `INSERT INTO passages
         (exercise_set_id, part_number, passage_type, title, passage_text, passage_vi, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [setId, part, p.passageType || null, p.title, p.passageText, p.passageVi || null, pOrder]
    );
    const passageId = pres.rows[0].id;
    for (const q of p.questions) {
      await insertQuestion(client, userId, setId, part, sort++, q, passageId);
      addedQ++;
    }
  }
  await client.query(
    "UPDATE exercise_sets SET question_count = (SELECT COUNT(*) FROM questions WHERE exercise_set_id = $1) WHERE id = $1",
    [setId]
  );
  return addedQ;
}

async function main() {
  const pool = new Pool({ connectionString: loadDatabaseUrl(), max: 4 });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const userId = await getDefaultUserId(client);

    const p5 = await seedPart5(client, userId);
    const p6 = await seedPassagePart(client, userId, "part6.json", 6);
    const p7 = await seedPassagePart(client, userId, "part7.json", 7);

    await client.query("COMMIT");
    console.log(`> Part 5: +${p5} câu`);
    console.log(`> Part 6: +${p6} câu`);
    console.log(`> Part 7: +${p7} câu`);

    const totals = await client.query(
      `SELECT part_number, COUNT(*)::int AS n
       FROM questions WHERE is_active = TRUE
       GROUP BY part_number ORDER BY part_number`
    );
    console.log("> Tổng câu trong kho theo part:");
    for (const r of totals.rows) console.log(`    Part ${r.part_number}: ${r.n} câu`);
    console.log("Nạp kho đề HOÀN TẤT.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Lỗi nạp kho đề:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
