import type { ToeicQuestion } from "./types";
import type { QuizSet } from "./types";

export const SEED_QUIZ: QuizSet = {
  id: "seed-word-forms-1",
  title: "Part 5 - Dạng từ (Word Forms) - Bài mẫu",
  source: "seed",
  createdAt: "2026-06-15T00:00:00.000Z",
  questions: [
    {
      id: "seed-1",
      sentence:
        "The continuing spread of office automation has increased worker's _______, resulting in job consolidation and lower demand for accounting clerks.",
      options: ["produce", "to produce", "productively", "productivity"],
      correctIndex: 3,
      category: "word_form",
      topic: "possessive + noun",
      explanation:
        "After the possessive \"worker's\", a noun is required. \"Productivity\" (noun) means the rate of output per worker.",
      explanationVi:
        "Sau sở hữu cách \"worker's\" cần danh từ. \"Productivity\" (năng suất) là danh từ, phù hợp với ngữ cảnh nói về mức độ làm việc của nhân viên.",
      vocabulary: [
        {
          word: "productivity",
          meaning: "năng suất",
          type: "noun",
          example: "Office automation increased worker productivity.",
        },
        {
          word: "consolidation",
          meaning: "sự hợp nhất, gộp việc",
          type: "noun",
        },
      ],
    },
    {
      id: "seed-2",
      sentence:
        "You will report _______ to the project manager and you will be responsible for overseeing the work of engineers and designers.",
      options: ["direction", "directing", "directly", "directs"],
      correctIndex: 2,
      category: "word_form",
      topic: "adverb modifying verb",
      explanation:
        "\"Report\" is a verb here; it needs an adverb to describe HOW you report. \"Directly\" modifies \"report\".",
      explanationVi:
        "\"Report\" ở đây là động từ (báo cáo), cần trạng từ bổ nghĩa cho cách báo cáo → \"directly\" (trực tiếp).",
      vocabulary: [
        { word: "directly", meaning: "trực tiếp", type: "adverb" },
        { word: "oversee", meaning: "giám sát", type: "verb" },
      ],
    },
    {
      id: "seed-3",
      sentence:
        "The event was well _______ and covered by numerous media including television stations and newspapers across the country.",
      options: ["publicizing", "publicized", "publicity", "publicize"],
      correctIndex: 1,
      category: "word_form",
      topic: "past participle in passive",
      explanation:
        "Passive voice: \"was + past participle\". \"Publicized\" is the past participle of \"publicize\".",
      explanationVi:
        "Câu bị động: was + quá khứ phân từ. \"Publicized\" (được quảng bá) là dạng đúng sau \"was well\".",
      vocabulary: [
        { word: "publicize", meaning: "quảng bá", type: "verb" },
        { word: "numerous", meaning: "nhiều, đa số", type: "adjective" },
      ],
    },
    {
      id: "seed-4",
      sentence:
        "Our monthly production capability is expected to grow significantly, owing to the _______ of our own factories in China.",
      options: ["expand", "expands", "expansion", "expansive"],
      correctIndex: 2,
      category: "word_form",
      topic: "article + noun",
      explanation:
        "After \"the\", a noun is needed. \"Expansion\" (the act of expanding) fits the preposition phrase \"owing to the expansion of...\".",
      explanationVi:
        "Sau \"the\" cần danh từ. \"Expansion\" (sự mở rộng) phù hợp với cụm \"owing to the expansion of our factories\".",
      vocabulary: [
        { word: "expansion", meaning: "sự mở rộng", type: "noun" },
        { word: "capability", meaning: "năng lực", type: "noun" },
      ],
    },
    {
      id: "seed-5",
      sentence:
        "The board of directors on December 20 _______ the annual budget which won't be official until signed by President John Wei.",
      options: ["approved", "approvable", "approval", "approvingly"],
      correctIndex: 0,
      category: "word_form",
      topic: "past tense verb",
      explanation:
        "The subject \"board of directors\" needs a past tense verb for the action on December 20. \"Approved\" is correct.",
      explanationVi:
        "Chủ ngữ \"board of directors\" cần động từ quá khứ chỉ hành động đã xảy ra ngày 20/12 → \"approved\" (đã phê duyệt).",
      vocabulary: [
        { word: "approve", meaning: "phê duyệt", type: "verb" },
        { word: "annual budget", meaning: "ngân sách hàng năm", type: "noun phrase" },
      ],
    },
    {
      id: "seed-6",
      sentence:
        "Technological progress is making it possible to produce goods more _______ with less labor input.",
      options: ["efficient", "efficiency", "efficiently", "efficiencies"],
      correctIndex: 2,
      category: "word_form",
      topic: "adverb modifying verb",
      explanation:
        "\"Produce\" is a verb; \"more\" modifies an adverb. \"Efficiently\" describes how goods are produced.",
      explanationVi:
        "\"Produce\" là động từ, \"more\" bổ nghĩa cho trạng từ → \"efficiently\" (một cách hiệu quả hơn).",
      vocabulary: [
        { word: "efficiently", meaning: "một cách hiệu quả", type: "adverb" },
        { word: "labor input", meaning: "đầu vào lao động", type: "noun phrase" },
      ],
    },
    {
      id: "seed-7",
      sentence:
        "If you are planning to install the machine by yourself, then we recommend that you visit one of our _______ dealers that can give you additional installation assistance.",
      options: ["authorized", "authorization", "authority", "authorize"],
      correctIndex: 0,
      category: "word_form",
      topic: "adjective modifying noun",
      explanation:
        "\"Dealers\" is a noun and needs an adjective modifier. \"Authorized\" means officially permitted.",
      explanationVi:
        "\"Dealers\" (đại lý) cần tính từ bổ nghĩa → \"authorized\" (được ủy quyền/chính hãng).",
      vocabulary: [
        { word: "authorized", meaning: "được ủy quyền", type: "adjective" },
        { word: "assistance", meaning: "sự hỗ trợ", type: "noun" },
      ],
    },
    {
      id: "seed-8",
      sentence:
        "In order to reduce costs, Busan Consulting's _______ use of office space and equipment has been adopted by many local businesses.",
      options: ["economical", "economy", "economist", "economize"],
      correctIndex: 0,
      category: "word_form",
      topic: "adjective + noun",
      explanation:
        "\"Use\" is a noun here; it needs an adjective. \"Economical\" means cost-effective/frugal.",
      explanationVi:
        "\"Use\" ở đây là danh từ (việc sử dụng), cần tính từ → \"economical\" (tiết kiệm, kinh tế).",
      vocabulary: [
        { word: "economical", meaning: "tiết kiệm, kinh tế", type: "adjective" },
        { word: "adopt", meaning: "áp dụng", type: "verb" },
      ],
    },
    {
      id: "seed-9",
      sentence:
        "Lawmakers must _______ find a way to cut another 11 million dollars from this year's budget to fix errors.",
      options: ["quicker", "quickest", "quickly", "quickness"],
      correctIndex: 2,
      category: "word_form",
      topic: "adverb modifying verb",
      explanation:
        "\"Find\" is a verb; it needs an adverb. \"Quickly\" modifies \"find\".",
      explanationVi:
        "\"Find\" là động từ, cần trạng từ bổ nghĩa → \"quickly\" (nhanh chóng).",
      vocabulary: [
        { word: "lawmaker", meaning: "nhà lập pháp", type: "noun" },
        { word: "quickly", meaning: "nhanh chóng", type: "adverb" },
      ],
    },
    {
      id: "seed-10",
      sentence:
        "Please pull up to the front gate once you arrive, where our guest relations manager will _______ escort you to your room.",
      options: ["glad", "gladly", "be glad", "be gladdened"],
      correctIndex: 1,
      category: "word_form",
      topic: "adverb modifying verb",
      explanation:
        "\"Escort\" is a verb; \"gladly\" (adverb) means willingly/ with pleasure.",
      explanationVi:
        "\"Escort\" là động từ, cần trạng từ → \"gladly\" (vui vẻ, sẵn lòng).",
      vocabulary: [
        { word: "gladly", meaning: "vui vẻ, sẵn lòng", type: "adverb" },
        { word: "escort", meaning: "hộ tống, đưa đón", type: "verb" },
      ],
    },
    {
      id: "seed-11",
      sentence:
        "Thanks to careful _______, the installation of new equipment did not disrupt or affect the plant's activities.",
      options: ["plan", "planner", "planning", "planned"],
      correctIndex: 2,
      category: "word_form",
      topic: "adjective + noun",
      explanation:
        "After \"careful\" (adjective), a noun is required. \"Planning\" is a gerund/noun meaning the process of planning.",
      explanationVi:
        "Sau tính từ \"careful\" cần danh từ → \"planning\" (sự lên kế hoạch cẩn thận).",
      vocabulary: [
        { word: "planning", meaning: "sự lên kế hoạch", type: "noun" },
        { word: "disrupt", meaning: "gây gián đoạn", type: "verb" },
      ],
    },
    {
      id: "seed-12",
      sentence:
        "Your new coffee machine comes with detailed _______ which will help you use it more effectively.",
      options: ["instruct", "instructing", "instructions", "instructional"],
      correctIndex: 2,
      category: "word_form",
      topic: "plural noun after adjective",
      explanation:
        "\"Detailed\" modifies a noun. \"Instructions\" (plural noun) refers to the manual/guide.",
      explanationVi:
        "\"Detailed\" bổ nghĩa cho danh từ → \"instructions\" (hướng dẫn chi tiết).",
      vocabulary: [
        { word: "instructions", meaning: "hướng dẫn", type: "noun" },
        { word: "effectively", meaning: "một cách hiệu quả", type: "adverb" },
      ],
    },
    {
      id: "seed-13",
      sentence:
        "Neobucks has more than 3,000 stores in the United States and 25 other countries, and its logo is _______ recognizable.",
      options: ["universe", "universal", "universally", "universality"],
      correctIndex: 2,
      category: "word_form",
      topic: "adverb modifying adjective",
      explanation:
        "\"Recognizable\" is an adjective; it needs an adverb modifier. \"Universally\" means by everyone/everywhere.",
      explanationVi:
        "\"Recognizable\" là tính từ, cần trạng từ bổ nghĩa → \"universally\" (được nhận diện rộng rãi).",
      vocabulary: [
        { word: "universally", meaning: "một cách phổ biến/toàn cầu", type: "adverb" },
        { word: "recognizable", meaning: "dễ nhận biết", type: "adjective" },
      ],
    },
  ],
};

export function getAllVocabulary(questions: ToeicQuestion[]) {
  const map = new Map<string, ToeicQuestion["vocabulary"][0]>();
  for (const q of questions) {
    for (const v of q.vocabulary) {
      map.set(v.word.toLowerCase(), v);
    }
  }
  return Array.from(map.values());
}
