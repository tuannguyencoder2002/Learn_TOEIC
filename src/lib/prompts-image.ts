export function buildImageExtractPrompt(imageCount = 1): string {
  const pagesNote =
    imageCount > 1
      ? `${imageCount} trang ảnh — trích câu theo thứ tự số trên sách.`
      : "1 trang ảnh bài tập TOEIC Part 5.";

  return `Bạn là giáo viên TOEIC Part 5. ${pagesNote}

Với MỖI câu hỏi, trích xuất và giải thích theo phong cách sách luyện thi Việt Nam:
- Câu tiếng Anh đầy đủ (điền đáp án đúng vào chỗ trống)
- Dịch cả câu sang tiếng Việt
- Hướng dẫn chọn dạng từ: "Trước/Sau [từ/cấu trúc] → [Loại từ]. [đáp án] ([nghĩa tiếng Việt])"

Trả về DUY NHẤT JSON (không markdown):
{
  "title": "tiêu đề bài",
  "reviewSummaryVi": "1 câu tóm tắt dạng bài",
  "category": "word_form",
  "questions": [
    {
      "questionNumber": 18,
      "sentence": "As the largest dealer..., Auto Fair maintains an _______ inventory...",
      "sentenceComplete": "As the largest dealer..., Auto Fair maintains an impressive inventory...",
      "sentenceVi": "Là đại lý lớn nhất bang, Auto Fair duy trì kho xe mới ấn tượng...",
      "options": ["impressive", "impress", "impression", "impressively"],
      "correctIndex": 0,
      "correctWord": "impressive",
      "wordType": "adjective",
      "meaningVi": "ấn tượng",
      "grammarHintVi": "Trước Noun \\"inventory\\" → Adjective",
      "category": "word_form",
      "topic": "word form"
    }
  ]
}

Quy tắc:
- questionNumber: số câu in trên sách (nếu có), không có thì bỏ qua
- sentence có "_______" hoặc "___"
- sentenceComplete: câu hoàn chỉnh với đáp án đúng
- grammarHintVi: ngắn gọn kiểu "Sau \\"a\\" → Noun" hoặc "Trước Noun \\"X\\" → Adjective"
- meaningVi: nghĩa tiếng Việt của đáp án đúng
- đúng 4 options, correctIndex 0-3
- bỏ câu mờ/không đọc được`;
}
