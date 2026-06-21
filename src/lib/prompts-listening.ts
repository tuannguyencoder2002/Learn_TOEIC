/** Prompt cho AI sinh bài luyện nghe TOEIC theo Part + chủ đề. */

const PART_SPEC: Record<number, string> = {
  1: "Part 1 (Mô tả tranh): mô tả một khung cảnh công sở/đời thường. transcript = 4 câu mô tả ngắn (A-D), chỉ 1 câu đúng. questions có ĐÚNG 1 câu hỏi: 'Which sentence best describes the scene?', options là 4 câu mô tả đó.",
  2: "Part 2 (Hỏi-Đáp): transcript là 1 câu hỏi/phát biểu ngắn. questions có ĐÚNG 1 câu hỏi 'Choose the best response.', options là 3 đáp (chỉ dùng 3 phần tử đầu, phần tử thứ 4 để chuỗi rỗng).",
  3: "Part 3 (Hội thoại): transcript là hội thoại 2 người (ghi rõ 'M:' và 'W:'), 6-9 lượt. questions gồm 3 câu hỏi (gist, detail, next action), mỗi câu 4 lựa chọn.",
  4: "Part 4 (Bài nói): transcript là 1 đoạn monologue (thông báo/voicemail/quảng cáo/tham quan), 5-7 câu. questions gồm 3 câu hỏi (context, detail, request), mỗi câu 4 lựa chọn.",
};

export function buildListeningPracticePrompt(
  part: number,
  theme?: string
): string {
  const spec = PART_SPEC[part] ?? PART_SPEC[3];
  const themeLine = theme?.trim()
    ? `Chủ đề bắt buộc: "${theme.trim()}".`
    : "Chủ đề: bối cảnh công sở/thương mại TOEIC phổ biến (tự chọn).";

  return `Bạn là giáo viên luyện thi TOEIC. Hãy tạo MỘT bài luyện NGHE cho ${spec}
${themeLine}
Trình độ band 600-750. Tiếng Anh tự nhiên, business English.

CHỈ trả về JSON hợp lệ (không markdown, không giải thích ngoài JSON) theo đúng cấu trúc:
{
  "title": "tiêu đề ngắn tiếng Việt",
  "partNumber": ${part},
  "transcript": "lời thoại/đoạn nghe đầy đủ bằng tiếng Anh (sẽ được đọc bằng giọng máy)",
  "questions": [
    {
      "question": "câu hỏi tiếng Anh",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanationVi": "giải thích ngắn bằng tiếng Việt vì sao đúng"
    }
  ],
  "vocab": [
    { "word": "từ", "ipa": "/ipa/", "meaningVi": "nghĩa tiếng Việt", "exampleEn": "câu ví dụ" }
  ]
}

Yêu cầu:
- "transcript" là tiếng Anh, KHÔNG chèn tiếng Việt vào đây.
- correctIndex là số 0-3 ứng với vị trí đáp án đúng trong "options".
- Mỗi options có đúng 4 phần tử (Part 2 chỉ dùng 3 đáp, để phần tử thứ 4 là "").
- "vocab": 4-6 từ trọng tâm xuất hiện trong transcript, kèm IPA và nghĩa tiếng Việt.`;
}
