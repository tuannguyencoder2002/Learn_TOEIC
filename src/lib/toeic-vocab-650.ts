/** TOEIC Band ~650 - từ vựng business phổ biến (600 Essential Words / ETS topics) */

export interface ToeicVocabItem {
  id: string;
  word: string;
  meaning: string;
  type: string;
  topic: string;
  example: string;
  exampleVi?: string;
}

export interface ToeicVocabUnit {
  id: string;
  title: string;
  titleVi: string;
  words: ToeicVocabItem[];
}

export const TOEIC_650_UNITS: ToeicVocabUnit[] = [
  {
    id: "office",
    title: "Office & Meetings",
    titleVi: "Văn phòng & Họp",
    words: [
      { id: "o1", word: "agenda", meaning: "chương trình nghị sự", type: "noun", topic: "meetings", example: "Please send me the meeting agenda before noon.", exampleVi: "Gửi chương trình họp trước trưa giúp tôi." },
      { id: "o2", word: "attend", meaning: "tham dự", type: "verb", topic: "meetings", example: "All managers must attend the briefing.", exampleVi: "Tất cả quản lý phải tham dự buổi briefing." },
      { id: "o3", word: "colleague", meaning: "đồng nghiệp", type: "noun", topic: "office", example: "My colleague will handle the report.", exampleVi: "Đồng nghiệp tôi sẽ xử lý báo cáo." },
      { id: "o4", word: "deadline", meaning: "hạn chót", type: "noun", topic: "office", example: "We cannot miss the project deadline.", exampleVi: "Chúng ta không thể trễ deadline dự án." },
      { id: "o5", word: "delegate", meaning: "ủy quyền, giao việc", type: "verb", topic: "office", example: "She delegated the task to her assistant.", exampleVi: "Cô ấy giao việc cho trợ lý." },
      { id: "o6", word: "efficient", meaning: "hiệu quả", type: "adjective", topic: "office", example: "The new system is more efficient.", exampleVi: "Hệ thống mới hiệu quả hơn." },
      { id: "o7", word: "postpone", meaning: "hoãn lại", type: "verb", topic: "meetings", example: "The conference was postponed until May.", exampleVi: "Hội nghị bị hoãn đến tháng 5." },
      { id: "o8", word: "schedule", meaning: "lịch trình", type: "noun", topic: "office", example: "Check the schedule for next week.", exampleVi: "Kiểm tra lịch tuần tới." },
      { id: "o9", word: "submit", meaning: "nộp, gửi", type: "verb", topic: "office", example: "Submit your expense report by Friday.", exampleVi: "Nộp báo cáo chi phí trước thứ Sáu." },
      { id: "o10", word: "conference", meaning: "hội nghị", type: "noun", topic: "meetings", example: "The annual conference starts on Monday.", exampleVi: "Hội nghị thường niên bắt đầu thứ Hai." },
      { id: "o11", word: "notify", meaning: "thông báo", type: "verb", topic: "office", example: "We will notify you when it is ready.", exampleVi: "Chúng tôi sẽ thông báo khi sẵn sàng." },
      { id: "o12", word: "procedure", meaning: "quy trình", type: "noun", topic: "office", example: "Follow the standard safety procedure.", exampleVi: "Tuân theo quy trình an toàn tiêu chuẩn." },
    ],
  },
  {
    id: "hr",
    title: "HR & Hiring",
    titleVi: "Nhân sự & Tuyển dụng",
    words: [
      { id: "h1", word: "applicant", meaning: "ứng viên", type: "noun", topic: "hiring", example: "There were over 200 applicants for the job.", exampleVi: "Có hơn 200 ứng viên cho vị trí này." },
      { id: "h2", word: "candidate", meaning: "ứng cử viên", type: "noun", topic: "hiring", example: "She is a strong candidate for the role.", exampleVi: "Cô ấy là ứng viên mạnh cho vị trí." },
      { id: "h3", word: "qualification", meaning: "bằng cấp, năng lực", type: "noun", topic: "hiring", example: "List your qualifications on the form.", exampleVi: "Liệt kê bằng cấp trên đơn." },
      { id: "h4", word: "resume", meaning: "sơ yếu lý lịch", type: "noun", topic: "hiring", example: "Please attach your resume to the email.", exampleVi: "Đính kèm CV vào email." },
      { id: "h5", word: "salary", meaning: "lương", type: "noun", topic: "benefits", example: "The salary is negotiable.", exampleVi: "Mức lương có thể thương lượng." },
      { id: "h6", word: "benefit", meaning: "phúc lợi", type: "noun", topic: "benefits", example: "Health insurance is a key benefit.", exampleVi: "Bảo hiểm sức khỏe là phúc lợi quan trọng." },
      { id: "h7", word: "promote", meaning: "thăng chức", type: "verb", topic: "hr", example: "He was promoted to senior manager.", exampleVi: "Anh ấy được thăng lên quản lý cấp cao." },
      { id: "h8", word: "train", meaning: "đào tạo", type: "verb", topic: "hr", example: "New staff are trained for two weeks.", exampleVi: "Nhân viên mới được đào tạo 2 tuần." },
      { id: "h9", word: "retire", meaning: "nghỉ hưu", type: "verb", topic: "hr", example: "She will retire at the end of the year.", exampleVi: "Cô ấy nghỉ hưu cuối năm." },
      { id: "h10", word: "employ", meaning: "tuyển dụng", type: "verb", topic: "hiring", example: "The firm employs 500 people.", exampleVi: "Công ty có 500 nhân viên." },
      { id: "h11", word: "resign", meaning: "từ chức", type: "verb", topic: "hr", example: "He resigned from his position last month.", exampleVi: "Anh ấy từ chức tháng trước." },
      { id: "h12", word: "personnel", meaning: "nhân sự", type: "noun", topic: "hr", example: "Contact personnel for more details.", exampleVi: "Liên hệ phòng nhân sự để biết thêm." },
    ],
  },
  {
    id: "finance",
    title: "Finance & Contracts",
    titleVi: "Tài chính & Hợp đồng",
    words: [
      { id: "f1", word: "budget", meaning: "ngân sách", type: "noun", topic: "finance", example: "We need to stay within budget.", exampleVi: "Chúng ta cần trong ngân sách." },
      { id: "f2", word: "invoice", meaning: "hóa đơn", type: "noun", topic: "finance", example: "The invoice will be sent tomorrow.", exampleVi: "Hóa đơn sẽ gửi ngày mai." },
      { id: "f3", word: "revenue", meaning: "doanh thu", type: "noun", topic: "finance", example: "Revenue increased by 10 percent.", exampleVi: "Doanh thu tăng 10%." },
      { id: "f4", word: "expense", meaning: "chi phí", type: "noun", topic: "finance", example: "Travel expenses will be reimbursed.", exampleVi: "Chi phí đi lại sẽ được hoàn." },
      { id: "f5", word: "contract", meaning: "hợp đồng", type: "noun", topic: "contracts", example: "Sign the contract before the deadline.", exampleVi: "Ký hợp đồng trước hạn." },
      { id: "f6", word: "negotiate", meaning: "đàm phán", type: "verb", topic: "contracts", example: "They negotiated a better price.", exampleVi: "Họ đàm phán được giá tốt hơn." },
      { id: "f7", word: "comply", meaning: "tuân thủ", type: "verb", topic: "contracts", example: "All parties must comply with the terms.", exampleVi: "Các bên phải tuân thủ điều khoản." },
      { id: "f8", word: "allocate", meaning: "phân bổ", type: "verb", topic: "finance", example: "Funds were allocated to marketing.", exampleVi: "Ngân sách được phân bổ cho marketing." },
      { id: "f9", word: "estimate", meaning: "ước tính", type: "verb", topic: "finance", example: "We estimate costs at $50,000.", exampleVi: "Chúng tôi ước tính chi phí $50,000." },
      { id: "f10", word: "refund", meaning: "hoàn tiền", type: "noun", topic: "finance", example: "You may request a full refund.", exampleVi: "Bạn có thể yêu cầu hoàn tiền đầy đủ." },
      { id: "f11", word: "overdue", meaning: "quá hạn", type: "adjective", topic: "finance", example: "The payment is overdue.", exampleVi: "Khoản thanh toán quá hạn." },
      { id: "f12", word: "transaction", meaning: "giao dịch", type: "noun", topic: "finance", example: "Each transaction is recorded automatically.", exampleVi: "Mỗi giao dịch được ghi tự động." },
    ],
  },
  {
    id: "business",
    title: "Business Operations",
    titleVi: "Vận hành kinh doanh",
    words: [
      { id: "b1", word: "inventory", meaning: "hàng tồn kho", type: "noun", topic: "operations", example: "Inventory levels are low this month.", exampleVi: "Tồn kho tháng này thấp." },
      { id: "b2", word: "shipment", meaning: "lô hàng gửi đi", type: "noun", topic: "shipping", example: "The shipment arrives on Tuesday.", exampleVi: "Lô hàng đến thứ Ba." },
      { id: "b3", word: "supplier", meaning: "nhà cung cấp", type: "noun", topic: "operations", example: "We switched to a new supplier.", exampleVi: "Chúng tôi chuyển sang nhà cung cấp mới." },
      { id: "b4", word: "distribute", meaning: "phân phối", type: "verb", topic: "operations", example: "Products are distributed nationwide.", exampleVi: "Sản phẩm được phân phối toàn quốc." },
      { id: "b5", word: "expand", meaning: "mở rộng", type: "verb", topic: "business", example: "The company plans to expand overseas.", exampleVi: "Công ty dự định mở rộng ra nước ngoài." },
      { id: "b6", word: "launch", meaning: "ra mắt", type: "verb", topic: "marketing", example: "They will launch a new product line.", exampleVi: "Họ sẽ ra mắt dòng sản phẩm mới." },
      { id: "b7", word: "client", meaning: "khách hàng", type: "noun", topic: "business", example: "The client approved the proposal.", exampleVi: "Khách hàng duyệt đề xuất." },
      { id: "b8", word: "competitive", meaning: "cạnh tranh", type: "adjective", topic: "business", example: "We offer competitive prices.", exampleVi: "Chúng tôi có giá cạnh tranh." },
      { id: "b9", word: "maintain", meaning: "duy trì", type: "verb", topic: "operations", example: "Maintain quality at all times.", exampleVi: "Luôn duy trì chất lượng." },
      { id: "b10", word: "warranty", meaning: "bảo hành", type: "noun", topic: "contracts", example: "The warranty covers two years.", exampleVi: "Bảo hành 2 năm." },
      { id: "b11", word: "facility", meaning: "cơ sở, nhà máy", type: "noun", topic: "operations", example: "The production facility is in Busan.", exampleVi: "Nhà máy sản xuất ở Busan." },
      { id: "b12", word: "collaborate", meaning: "hợp tác", type: "verb", topic: "business", example: "Teams collaborate on large projects.", exampleVi: "Các team hợp tác trong dự án lớn." },
    ],
  },
];

export const ALL_TOEIC_650 = TOEIC_650_UNITS.flatMap((u) => u.words);

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickDistractors(
  correct: ToeicVocabItem,
  pool: ToeicVocabItem[],
  count: number,
  field: "meaning" | "word"
): string[] {
  const others = shuffle(pool.filter((w) => w.id !== correct.id));
  return others.slice(0, count).map((w) => (field === "meaning" ? w.meaning : w.word));
}
