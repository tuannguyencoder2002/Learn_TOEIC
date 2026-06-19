/** TOEIC Band ~650 - từ vựng business phổ biến (600 Essential Words / ETS topics) */

export interface ToeicVocabItem {
  id: string;
  word: string;
  meaning: string;
  type: string;
  topic: string;
  example: string;
  exampleVi?: string;
  /** Các Part TOEIC mà từ này hay xuất hiện (5/6/7). Gán từ unit. */
  parts?: number[];
  unitId?: string;
}

export interface ToeicVocabUnit {
  id: string;
  title: string;
  titleVi: string;
  /** Các Part TOEIC mà nhóm từ này hay gặp. */
  parts: number[];
  words: ToeicVocabItem[];
}

export const TOEIC_650_UNITS: ToeicVocabUnit[] = [
  {
    id: "office",
    title: "Office & Meetings",
    titleVi: "Văn phòng & Họp",
    parts: [5, 6, 7],
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
    parts: [5, 6, 7],
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
    parts: [5, 7],
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
    parts: [5, 6, 7],
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
  {
    id: "marketing",
    title: "Marketing & Sales",
    titleVi: "Marketing & Bán hàng",
    parts: [5, 6, 7],
    words: [
      { id: "m1", word: "advertise", meaning: "quảng cáo", type: "verb", topic: "marketing", example: "They advertise on social media.", exampleVi: "Họ quảng cáo trên mạng xã hội." },
      { id: "m2", word: "promotion", meaning: "khuyến mãi, quảng bá", type: "noun", topic: "marketing", example: "The store is offering a summer promotion.", exampleVi: "Cửa hàng đang có khuyến mãi mùa hè." },
      { id: "m3", word: "brand", meaning: "thương hiệu", type: "noun", topic: "marketing", example: "The brand is well known worldwide.", exampleVi: "Thương hiệu nổi tiếng toàn cầu." },
      { id: "m4", word: "discount", meaning: "giảm giá", type: "noun", topic: "sales", example: "Members receive a 10 percent discount.", exampleVi: "Hội viên được giảm 10%." },
      { id: "m5", word: "campaign", meaning: "chiến dịch", type: "noun", topic: "marketing", example: "The ad campaign was a great success.", exampleVi: "Chiến dịch quảng cáo rất thành công." },
      { id: "m6", word: "target", meaning: "nhắm tới, mục tiêu", type: "verb", topic: "marketing", example: "The product targets young professionals.", exampleVi: "Sản phẩm nhắm tới người trẻ đi làm." },
      { id: "m7", word: "retail", meaning: "bán lẻ", type: "noun", topic: "sales", example: "Retail sales rose last quarter.", exampleVi: "Doanh số bán lẻ tăng quý trước." },
      { id: "m8", word: "demand", meaning: "nhu cầu", type: "noun", topic: "sales", example: "Demand for the product is high.", exampleVi: "Nhu cầu về sản phẩm rất cao." },
      { id: "m9", word: "feature", meaning: "tính năng, đặc điểm", type: "noun", topic: "marketing", example: "The phone has many useful features.", exampleVi: "Điện thoại có nhiều tính năng hữu ích." },
      { id: "m10", word: "loyalty", meaning: "sự trung thành", type: "noun", topic: "marketing", example: "The program rewards customer loyalty.", exampleVi: "Chương trình thưởng cho khách hàng trung thành." },
      { id: "m11", word: "survey", meaning: "khảo sát", type: "noun", topic: "marketing", example: "Please complete the customer survey.", exampleVi: "Vui lòng hoàn thành khảo sát khách hàng." },
      { id: "m12", word: "merchandise", meaning: "hàng hóa", type: "noun", topic: "sales", example: "All merchandise is on sale today.", exampleVi: "Toàn bộ hàng hóa giảm giá hôm nay." },
    ],
  },
  {
    id: "travel",
    title: "Travel & Business Trips",
    titleVi: "Du lịch & Công tác",
    parts: [6, 7],
    words: [
      { id: "t1", word: "reservation", meaning: "đặt chỗ", type: "noun", topic: "travel", example: "I made a reservation for two nights.", exampleVi: "Tôi đã đặt phòng hai đêm." },
      { id: "t2", word: "itinerary", meaning: "lịch trình", type: "noun", topic: "travel", example: "Here is your travel itinerary.", exampleVi: "Đây là lịch trình chuyến đi của bạn." },
      { id: "t3", word: "depart", meaning: "khởi hành", type: "verb", topic: "travel", example: "The flight departs at 8 A.M.", exampleVi: "Chuyến bay khởi hành lúc 8 giờ sáng." },
      { id: "t4", word: "boarding", meaning: "lên máy bay/tàu", type: "noun", topic: "travel", example: "Boarding begins 30 minutes before departure.", exampleVi: "Việc lên máy bay bắt đầu 30 phút trước giờ bay." },
      { id: "t5", word: "accommodation", meaning: "chỗ ở", type: "noun", topic: "travel", example: "The company will arrange accommodation.", exampleVi: "Công ty sẽ thu xếp chỗ ở." },
      { id: "t6", word: "confirm", meaning: "xác nhận", type: "verb", topic: "travel", example: "Please confirm your booking by email.", exampleVi: "Vui lòng xác nhận đặt chỗ qua email." },
      { id: "t7", word: "luggage", meaning: "hành lý", type: "noun", topic: "travel", example: "Each passenger may bring one piece of luggage.", exampleVi: "Mỗi khách được mang một kiện hành lý." },
      { id: "t8", word: "delay", meaning: "trì hoãn, hoãn", type: "noun", topic: "travel", example: "The flight was delayed by two hours.", exampleVi: "Chuyến bay bị hoãn hai tiếng." },
      { id: "t9", word: "fare", meaning: "giá vé", type: "noun", topic: "travel", example: "The train fare has increased.", exampleVi: "Giá vé tàu đã tăng." },
      { id: "t10", word: "destination", meaning: "điểm đến", type: "noun", topic: "travel", example: "Our final destination is Tokyo.", exampleVi: "Điểm đến cuối cùng của chúng tôi là Tokyo." },
      { id: "t11", word: "check-in", meaning: "làm thủ tục nhận phòng/chuyến bay", type: "noun", topic: "travel", example: "Hotel check-in starts at 2 P.M.", exampleVi: "Nhận phòng khách sạn từ 2 giờ chiều." },
      { id: "t12", word: "voucher", meaning: "phiếu, voucher", type: "noun", topic: "travel", example: "Use this voucher for a free breakfast.", exampleVi: "Dùng phiếu này để ăn sáng miễn phí." },
    ],
  },
  {
    id: "technology",
    title: "Technology & IT",
    titleVi: "Công nghệ & IT",
    parts: [5, 7],
    words: [
      { id: "te1", word: "install", meaning: "cài đặt", type: "verb", topic: "technology", example: "Please install the latest software update.", exampleVi: "Vui lòng cài bản cập nhật phần mềm mới nhất." },
      { id: "te2", word: "device", meaning: "thiết bị", type: "noun", topic: "technology", example: "The app works on any mobile device.", exampleVi: "Ứng dụng chạy trên mọi thiết bị di động." },
      { id: "te3", word: "upgrade", meaning: "nâng cấp", type: "verb", topic: "technology", example: "We plan to upgrade the network this year.", exampleVi: "Chúng tôi dự định nâng cấp mạng năm nay." },
      { id: "te4", word: "access", meaning: "truy cập", type: "verb", topic: "technology", example: "You can access the files remotely.", exampleVi: "Bạn có thể truy cập tệp từ xa." },
      { id: "te5", word: "data", meaning: "dữ liệu", type: "noun", topic: "technology", example: "Customer data must be kept secure.", exampleVi: "Dữ liệu khách hàng phải được bảo mật." },
      { id: "te6", word: "feature", meaning: "tính năng", type: "noun", topic: "technology", example: "The new version adds several features.", exampleVi: "Phiên bản mới thêm vài tính năng." },
      { id: "te7", word: "technical", meaning: "thuộc kỹ thuật", type: "adjective", topic: "technology", example: "Contact technical support for help.", exampleVi: "Liên hệ hỗ trợ kỹ thuật để được giúp." },
      { id: "te8", word: "maintenance", meaning: "bảo trì", type: "noun", topic: "technology", example: "The system is down for maintenance.", exampleVi: "Hệ thống tạm ngưng để bảo trì." },
      { id: "te9", word: "backup", meaning: "sao lưu", type: "noun", topic: "technology", example: "Make a backup of your documents.", exampleVi: "Hãy sao lưu tài liệu của bạn." },
      { id: "te10", word: "network", meaning: "mạng lưới", type: "noun", topic: "technology", example: "The office network is very fast.", exampleVi: "Mạng văn phòng rất nhanh." },
      { id: "te11", word: "password", meaning: "mật khẩu", type: "noun", topic: "technology", example: "Change your password every month.", exampleVi: "Đổi mật khẩu mỗi tháng." },
      { id: "te12", word: "function", meaning: "chức năng, hoạt động", type: "noun", topic: "technology", example: "This button has a special function.", exampleVi: "Nút này có một chức năng đặc biệt." },
    ],
  },
  {
    id: "customer",
    title: "Customer Service",
    titleVi: "Dịch vụ khách hàng",
    parts: [6, 7],
    words: [
      { id: "c1", word: "complaint", meaning: "lời phàn nàn, khiếu nại", type: "noun", topic: "customer", example: "We take every complaint seriously.", exampleVi: "Chúng tôi xem trọng mọi khiếu nại." },
      { id: "c2", word: "refund", meaning: "hoàn tiền", type: "noun", topic: "customer", example: "You are entitled to a full refund.", exampleVi: "Bạn được hoàn tiền đầy đủ." },
      { id: "c3", word: "replace", meaning: "thay thế", type: "verb", topic: "customer", example: "We will replace the damaged item.", exampleVi: "Chúng tôi sẽ thay món hàng bị hỏng." },
      { id: "c4", word: "inquiry", meaning: "câu hỏi, yêu cầu thông tin", type: "noun", topic: "customer", example: "Please direct your inquiry to our team.", exampleVi: "Vui lòng gửi câu hỏi tới nhóm của chúng tôi." },
      { id: "c5", word: "satisfaction", meaning: "sự hài lòng", type: "noun", topic: "customer", example: "Customer satisfaction is our priority.", exampleVi: "Sự hài lòng của khách là ưu tiên của chúng tôi." },
      { id: "c6", word: "assist", meaning: "hỗ trợ", type: "verb", topic: "customer", example: "Our staff will gladly assist you.", exampleVi: "Nhân viên sẽ vui lòng hỗ trợ bạn." },
      { id: "c7", word: "warranty", meaning: "bảo hành", type: "noun", topic: "customer", example: "The product comes with a one-year warranty.", exampleVi: "Sản phẩm có bảo hành một năm." },
      { id: "c8", word: "feedback", meaning: "phản hồi", type: "noun", topic: "customer", example: "We welcome your feedback.", exampleVi: "Chúng tôi hoan nghênh phản hồi của bạn." },
      { id: "c9", word: "resolve", meaning: "giải quyết", type: "verb", topic: "customer", example: "We resolved the issue within a day.", exampleVi: "Chúng tôi giải quyết vấn đề trong một ngày." },
      { id: "c10", word: "apologize", meaning: "xin lỗi", type: "verb", topic: "customer", example: "We apologize for the inconvenience.", exampleVi: "Chúng tôi xin lỗi vì sự bất tiện." },
      { id: "c11", word: "replacement", meaning: "hàng thay thế", type: "noun", topic: "customer", example: "A replacement will be shipped today.", exampleVi: "Hàng thay thế sẽ được gửi hôm nay." },
      { id: "c12", word: "guarantee", meaning: "bảo đảm", type: "noun", topic: "customer", example: "We offer a money-back guarantee.", exampleVi: "Chúng tôi bảo đảm hoàn tiền." },
    ],
  },
];

export const ALL_TOEIC_650: ToeicVocabItem[] = TOEIC_650_UNITS.flatMap((u) =>
  u.words.map((w) => ({ ...w, parts: u.parts, unitId: u.id }))
);

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
