-- Seed idempotent voi UUID ngau nhien (gen_random_uuid)
SET client_encoding TO 'UTF8';

INSERT INTO users (username, display_name)
VALUES ('default', E'H\u1ecdc vi\u00ean')
ON CONFLICT (username) DO NOTHING;

INSERT INTO grammar_topics (code, name_vi, name_en, description) VALUES
  ('possessive_noun', E'S\u1edf h\u1eefu c\u00e1ch + Danh t\u1eeb', 'Possessive + Noun', E'Sau worker''s, company''s c\u1ea7n danh t\u1eeb'),
  ('adv_verb', E'Tr\u1ea1ng t\u1eeb b\u1ed5 ngh\u0129a \u0111\u1ed9ng t\u1eeb', 'Adverb modifying Verb', 'Report directly, find quickly'),
  ('passive_pp', E'B\u1ecb \u0111\u1ed9ng + Qu\u00e1 kh\u1ee9 ph\u00e2n t\u1eeb', 'Passive + Past Participle', 'was/were + V3/ed'),
  ('article_noun', E'M\u1ea1o t\u1eeb + Danh t\u1eeb', 'Article + Noun', 'the expansion, a decision'),
  ('past_tense', E'Th\u00ec qu\u00e1 kh\u1ee9 \u0111\u01a1n', 'Simple Past', 'Subject + V2/ed'),
  ('adv_adj', E'Tr\u1ea1ng t\u1eeb b\u1ed5 ngh\u0129a t\u00ednh t\u1eeb', 'Adverb modifying Adjective', 'universally recognizable'),
  ('adj_noun', E'T\u00ednh t\u1eeb + Danh t\u1eeb', 'Adjective + Noun', 'authorized dealers, economical use'),
  ('gerund_noun', E'Danh \u0111\u1ed9ng t\u1eeb / Gerund', 'Gerund as Noun', 'careful planning')
ON CONFLICT (code) DO NOTHING;

INSERT INTO exercise_sets (user_id, title, source_type, part_number, category, question_count)
SELECT u.id,
  E'Part 5 - D\u1ea1ng t\u1eeb (Word Forms) - B\u00e0i m\u1eabu',
  'seed', 5, 'word_form', 13
FROM users u
WHERE u.username = 'default'
  AND NOT EXISTS (
    SELECT 1 FROM exercise_sets es
    WHERE es.source_type = 'seed'
      AND es.title = E'Part 5 - D\u1ea1ng t\u1eeb (Word Forms) - B\u00e0i m\u1eabu'
  );

WITH seed_set AS (
  SELECT id FROM exercise_sets
  WHERE source_type = 'seed'
    AND title = E'Part 5 - D\u1ea1ng t\u1eeb (Word Forms) - B\u00e0i m\u1eabu'
  LIMIT 1
)
INSERT INTO questions (exercise_set_id, sort_order, sentence, correct_index, category, topic, explanation_en, explanation_vi)
SELECT s.id, v.sort_order, v.sentence, v.correct_index, v.category, v.topic, v.explanation_en, v.explanation_vi
FROM seed_set s
CROSS JOIN (VALUES
  (1, 'The continuing spread of office automation has increased worker''s _______, resulting in job consolidation and lower demand for accounting clerks.', 3, 'word_form', 'possessive + noun',
   'After the possessive "worker''s", a noun is required. "Productivity" means the rate of output per worker.',
   E'Sau s\u1edf h\u1eefu c\u00e1ch "worker''s" c\u1ea7n danh t\u1eeb. "Productivity" (n\u0103ng su\u1ea5t) l\u00e0 danh t\u1eeb ph\u00f9 h\u1ee3p.'),
  (2, 'You will report _______ to the project manager and you will be responsible for overseeing the work of engineers and designers.', 2, 'word_form', 'adverb modifying verb',
   '"Report" is a verb; it needs an adverb. "Directly" modifies "report".',
   E'"Report" l\u00e0 \u0111\u1ed9ng t\u1eeb, c\u1ea7n tr\u1ea1ng t\u1eeb \u2192 "directly" (tr\u1ef1c ti\u1ebfp).'),
  (3, 'The event was well _______ and covered by numerous media including television stations and newspapers across the country.', 1, 'word_form', 'passive + past participle',
   'Passive: was + past participle. "Publicized" is correct.',
   E'C\u00e2u b\u1ecb \u0111\u1ed9ng: was + qu\u00e1 kh\u1ee9 ph\u00e2n t\u1eeb \u2192 "publicized".'),
  (4, 'Our monthly production capability is expected to grow significantly, owing to the _______ of our own factories in China.', 2, 'word_form', 'article + noun',
   'After "the", a noun is needed. "Expansion" fits.',
   E'Sau "the" c\u1ea7n danh t\u1eeb \u2192 "expansion" (s\u1ef1 m\u1edf r\u1ed9ng).'),
  (5, 'The board of directors on December 20 _______ the annual budget which won''t be official until signed by President John Wei.', 0, 'word_form', 'past tense verb',
   'Subject needs past tense verb for action on December 20.',
   E'C\u1ea7n \u0111\u1ed9ng t\u1eeb qu\u00e1 kh\u1ee9 \u2192 "approved" (\u0111\u00e3 ph\u00ea duy\u1ec7t).'),
  (6, 'Technological progress is making it possible to produce goods more _______ with less labor input.', 2, 'word_form', 'adverb modifying verb',
   '"Produce" is a verb; "more" modifies adverb "efficiently".',
   E'"Produce" l\u00e0 \u0111\u1ed9ng t\u1eeb \u2192 "efficiently" (hi\u1ec7u qu\u1ea3 h\u01a1n).'),
  (7, 'If you are planning to install the machine by yourself, then we recommend that you visit one of our _______ dealers that can give you additional installation assistance.', 0, 'word_form', 'adjective modifying noun',
   '"Dealers" needs adjective "authorized".',
   E'"Dealers" c\u1ea7n t\u00ednh t\u1eeb \u2192 "authorized" (ch\u00ednh h\u00e3ng).'),
  (8, 'In order to reduce costs, Busan Consulting''s _______ use of office space and equipment has been adopted by many local businesses.', 0, 'word_form', 'adjective + noun',
   '"Use" is noun; needs adjective "economical".',
   E'"Use" l\u00e0 danh t\u1eeb \u2192 "economical" (ti\u1ebft ki\u1ec7m).'),
  (9, 'Lawmakers must _______ find a way to cut another 11 million dollars from this year''s budget to fix errors.', 2, 'word_form', 'adverb modifying verb',
   '"Find" needs adverb "quickly".',
   E'"Find" c\u1ea7n tr\u1ea1ng t\u1eeb \u2192 "quickly".'),
  (10, 'Please pull up to the front gate once you arrive, where our guest relations manager will _______ escort you to your room.', 1, 'word_form', 'adverb modifying verb',
   '"Escort" needs adverb "gladly".',
   E'"Escort" c\u1ea7n tr\u1ea1ng t\u1eeb \u2192 "gladly".'),
  (11, 'Thanks to careful _______, the installation of new equipment did not disrupt or affect the plant''s activities.', 2, 'word_form', 'adjective + noun/gerund',
   'After "careful", noun "planning" is required.',
   E'Sau "careful" c\u1ea7n danh t\u1eeb \u2192 "planning".'),
  (12, 'Your new coffee machine comes with detailed _______ which will help you use it more effectively.', 2, 'word_form', 'plural noun',
   '"Detailed" modifies noun "instructions".',
   E'"Detailed" b\u1ed5 ngh\u0129a danh t\u1eeb \u2192 "instructions".'),
  (13, 'Neobucks has more than 3,000 stores in the United States and 25 other countries, and its logo is _______ recognizable.', 2, 'word_form', 'adverb modifying adjective',
   '"Recognizable" needs adverb "universally".',
   E'"Recognizable" c\u1ea7n tr\u1ea1ng t\u1eeb \u2192 "universally".')
) AS v(sort_order, sentence, correct_index, category, topic, explanation_en, explanation_vi)
ON CONFLICT (exercise_set_id, sort_order) DO NOTHING;

INSERT INTO question_options (question_id, option_index, option_text)
SELECT q.id, o.opt_idx, o.opt_text
FROM questions q
JOIN exercise_sets es ON es.id = q.exercise_set_id
JOIN (VALUES
  (1, 0, 'produce'), (1, 1, 'to produce'), (1, 2, 'productively'), (1, 3, 'productivity'),
  (2, 0, 'direction'), (2, 1, 'directing'), (2, 2, 'directly'), (2, 3, 'directs'),
  (3, 0, 'publicizing'), (3, 1, 'publicized'), (3, 2, 'publicity'), (3, 3, 'publicize'),
  (4, 0, 'expand'), (4, 1, 'expands'), (4, 2, 'expansion'), (4, 3, 'expansive'),
  (5, 0, 'approved'), (5, 1, 'approvable'), (5, 2, 'approval'), (5, 3, 'approvingly'),
  (6, 0, 'efficient'), (6, 1, 'efficiency'), (6, 2, 'efficiently'), (6, 3, 'efficiencies'),
  (7, 0, 'authorized'), (7, 1, 'authorization'), (7, 2, 'authority'), (7, 3, 'authorize'),
  (8, 0, 'economical'), (8, 1, 'economy'), (8, 2, 'economist'), (8, 3, 'economize'),
  (9, 0, 'quicker'), (9, 1, 'quickest'), (9, 2, 'quickly'), (9, 3, 'quickness'),
  (10, 0, 'glad'), (10, 1, 'gladly'), (10, 2, 'be glad'), (10, 3, 'be gladdened'),
  (11, 0, 'plan'), (11, 1, 'planner'), (11, 2, 'planning'), (11, 3, 'planned'),
  (12, 0, 'instruct'), (12, 1, 'instructing'), (12, 2, 'instructions'), (12, 3, 'instructional'),
  (13, 0, 'universe'), (13, 1, 'universal'), (13, 2, 'universally'), (13, 3, 'universality')
) AS o(sort_order, opt_idx, opt_text) ON q.sort_order = o.sort_order
WHERE es.source_type = 'seed'
  AND es.title = E'Part 5 - D\u1ea1ng t\u1eeb (Word Forms) - B\u00e0i m\u1eabu'
ON CONFLICT (question_id, option_index) DO NOTHING;

INSERT INTO user_question_progress (user_id, question_id, next_review_at, mastery_level)
SELECT u.id, q.id, NOW(), 0
FROM users u
JOIN questions q ON TRUE
JOIN exercise_sets es ON es.id = q.exercise_set_id
WHERE u.username = 'default'
  AND es.source_type = 'seed'
  AND es.title = E'Part 5 - D\u1ea1ng t\u1eeb (Word Forms) - B\u00e0i m\u1eabu'
ON CONFLICT (user_id, question_id) DO NOTHING;
