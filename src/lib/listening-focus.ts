/**
 * Trọng tâm Listening TOEIC — kiến thức cốt lõi từng Part (1–4).
 * Dùng cho tab "🎯 Trọng tâm" ở trang /listening: học dạng bài, bẫy thường gặp,
 * cấu trúc/ngữ pháp, mẹo nghe (trọng âm, nối âm) và từ vựng theo chủ đề.
 *
 * Tiếng Việt có dấu (nội dung hiển thị trong web app).
 */

export interface FocusVocab {
  word: string;
  /** Phiên âm IPA, vd /ˈɔː.fɪs/ */
  ipa?: string;
  /** Gợi ý trọng âm: viết hoa âm tiết nhấn, vd "OF-fice" */
  stress?: string;
  meaningVi: string;
  exampleEn: string;
}

export interface FocusTip {
  title: string;
  detail: string;
  /** Câu ví dụ tiếng Anh để nghe (TTS) — không bắt buộc. */
  exampleEn?: string;
}

export interface FocusTheme {
  name: string;
  vocab: FocusVocab[];
}

export interface ListeningFocusPart {
  part: 1 | 2 | 3 | 4;
  title: string;
  emoji: string;
  /** Mô tả format thi thật. */
  format: string;
  overview: string;
  /** Bẫy/đặc điểm dễ sai. */
  traps: string[];
  /** Cấu trúc / ngữ pháp trọng tâm. */
  grammarFocus: FocusTip[];
  /** Mẹo nghe: trọng âm, nối âm, số/giờ... */
  listeningTips: FocusTip[];
  /** Mẫu câu hỏi hay gặp (Part 2/3/4). */
  patterns?: string[];
  /** Từ vựng theo chủ đề. */
  themes: FocusTheme[];
}

export const LISTENING_FOCUS: ListeningFocusPart[] = [
  {
    part: 1,
    title: "Part 1 — Mô tả tranh",
    emoji: "🖼️",
    format: "6 câu. Nhìn 1 bức ảnh, nghe 4 câu mô tả (A–D), chọn câu ĐÚNG NHẤT.",
    overview:
      "Phần dễ ăn điểm nhất. Hầu hết đáp án đúng dùng thì hiện tại tiếp diễn hoặc bị động. Nhìn kỹ ảnh trước khi audio chạy: ai đang làm gì, vật ở đâu.",
    traps: [
      "Bẫy âm giống nhau: nghe 'copy' nhưng ảnh là 'coffee', 'glasses' (kính) vs 'glass' (ly).",
      "Từ đúng nhưng hành động sai: trong ảnh người ĐANG ngồi, đáp lại nói 'standing'.",
      "Người/vật KHÔNG có trong ảnh nhưng câu nhắc tới.",
      "Sai thì: ảnh việc đã xong (hàng đã chất xong) nhưng đáp nói 'is loading' (đang chất).",
      "Bị động tiếp diễn 'is being + V3' (đang được làm) — chỉ đúng khi có người đang thao tác.",
    ],
    grammarFocus: [
      {
        title: "Hiện tại tiếp diễn (chủ động)",
        detail: "S + is/are + V-ing: tả người đang làm gì.",
        exampleEn: "A man is typing on a laptop.",
      },
      {
        title: "Bị động tiếp diễn: is/are being + V3",
        detail:
          "Diễn tả vật ĐANG được tác động bởi người. Phải thấy người đang thao tác mới đúng.",
        exampleEn: "A car is being washed.",
      },
      {
        title: "Bị động trạng thái: has been / is + V3",
        detail: "Tả kết quả/trạng thái tĩnh của vật, không cần người.",
        exampleEn: "Chairs have been arranged in rows.",
      },
      {
        title: "There is / There are + giới từ vị trí",
        detail: "Tả vị trí đồ vật: on, under, next to, in front of, against the wall.",
        exampleEn: "There are some boxes stacked against the wall.",
      },
    ],
    listeningTips: [
      {
        title: "Nghe kỹ động từ chính",
        detail: "Động từ quyết định đúng/sai. Tập trung vào V-ing đầu tiên nghe được.",
      },
      {
        title: "Trọng âm danh từ vs động từ",
        detail:
          "Nhiều từ đổi nghĩa theo trọng âm: 'REcord' (n. hồ sơ) vs 're-CORD' (v. ghi).",
        exampleEn: "They record the meeting. It is on record.",
      },
      {
        title: "Nối âm (linking)",
        detail: "'picked up', 'looking at' đọc dính: pick-tup, looki-nat. Quen để bắt kịp.",
        exampleEn: "She is looking at the screen.",
      },
    ],
    themes: [
      {
        name: "Văn phòng",
        vocab: [
          { word: "document", ipa: "/ˈdɒk.ju.mənt/", stress: "DOC-u-ment", meaningVi: "tài liệu", exampleEn: "She is reviewing a document." },
          { word: "drawer", ipa: "/drɔːr/", stress: "DRAW-er", meaningVi: "ngăn kéo", exampleEn: "He is opening a drawer." },
          { word: "photocopier", ipa: "/ˈfəʊ.təˌkɒp.i.ər/", stress: "PHO-to-cop-i-er", meaningVi: "máy photo", exampleEn: "A man is using the photocopier." },
        ],
      },
      {
        name: "Nhà hàng / Quán",
        vocab: [
          { word: "tray", ipa: "/treɪ/", stress: "TRAY", meaningVi: "khay", exampleEn: "A waiter is carrying a tray." },
          { word: "counter", ipa: "/ˈkaʊn.tər/", stress: "COUN-ter", meaningVi: "quầy", exampleEn: "Customers are standing at the counter." },
          { word: "beverage", ipa: "/ˈbev.ər.ɪdʒ/", stress: "BEV-er-age", meaningVi: "đồ uống", exampleEn: "Beverages are being served." },
        ],
      },
      {
        name: "Giao thông / Ngoài trời",
        vocab: [
          { word: "pedestrian", ipa: "/pəˈdes.tri.ən/", stress: "pe-DES-tri-an", meaningVi: "người đi bộ", exampleEn: "Pedestrians are crossing the street." },
          { word: "vehicle", ipa: "/ˈviː.ɪ.kəl/", stress: "VE-hi-cle", meaningVi: "phương tiện", exampleEn: "Vehicles are parked along the road." },
          { word: "railing", ipa: "/ˈreɪ.lɪŋ/", stress: "RAIL-ing", meaningVi: "lan can", exampleEn: "She is leaning on the railing." },
        ],
      },
    ],
  },
  {
    part: 2,
    title: "Part 2 — Hỏi & Đáp",
    emoji: "💬",
    format: "25 câu. Nghe 1 câu hỏi/phát biểu, nghe 3 đáp (A–C), chọn đáp PHÙ HỢP nhất. Không có đề in, không hình.",
    overview:
      "Khó vì không có gì để đọc — phải nghe và nhớ. 3 TỪ ĐẦU quyết định loại câu hỏi. Đáp gián tiếp ('I'm not sure', 'Let me check') thường là đáp đúng và hay bị bỏ qua.",
    traps: [
      "Bẫy lặp âm: đáp chứa từ nghe giống trong câu hỏi (work/walk, fine/find) → thường SAI.",
      "Đáp lặp đúng nguyên từ trong câu hỏi → đa số là bẫy.",
      "Câu hỏi Wh- không trả lời bằng Yes/No.",
      "Đáp gián tiếp nghe 'lạc đề' nhưng hợp lý: 'When is the report due?' → 'It's already done.'",
    ],
    grammarFocus: [
      { title: "Wh-question", detail: "Who/What/When/Where/Why/How — KHÔNG đáp Yes/No.", exampleEn: "Where did you put the files?" },
      { title: "Yes/No & câu hỏi đuôi", detail: "'Do you...?', 'Isn't it...?', '..., right?' — vẫn có thể đáp gián tiếp.", exampleEn: "You've met the new manager, haven't you?" },
      { title: "Câu lựa chọn (A or B)", detail: "Đáp thường chọn 1 vế, hoặc 'Either is fine.'", exampleEn: "Should we meet now or after lunch?" },
      { title: "Đề nghị / Yêu cầu", detail: "'Why don't you...', 'Could you...', 'Would you mind...' → đáp đồng ý/từ chối.", exampleEn: "Could you send me the agenda?" },
    ],
    listeningTips: [
      { title: "Bắt 3 từ đầu", detail: "Loại câu hỏi nằm ở đầu. Nghe trượt từ đầu là mất câu." },
      { title: "Ngữ điệu (intonation)", detail: "Lên giọng cuối = yes/no; xuống giọng = Wh-/phát biểu." },
      { title: "Trọng âm rơi vào từ nội dung", detail: "Danh từ/động từ/tính từ được nhấn; 'a, the, of, to' đọc lướt." },
    ],
    patterns: [
      "Who — người / phòng ban",
      "When — thời gian ('Not until Friday', 'In an hour')",
      "Where — nơi chốn / 'Check with...'",
      "Why — lý do ('Because...', 'To...')",
      "How — cách thức / How much / How long / How often",
      "Đáp né: 'I'm not sure', 'Let me check', 'Ask Mr. Tanaka'",
    ],
    themes: [
      {
        name: "Lịch & cuộc họp",
        vocab: [
          { word: "schedule", ipa: "/ˈʃedʒ.uːl/", stress: "SCHED-ule", meaningVi: "lịch / lên lịch", exampleEn: "Let's schedule the call for Monday." },
          { word: "postpone", ipa: "/pəʊstˈpəʊn/", stress: "post-PONE", meaningVi: "hoãn lại", exampleEn: "They postponed the meeting." },
          { word: "agenda", ipa: "/əˈdʒen.də/", stress: "a-GEN-da", meaningVi: "chương trình họp", exampleEn: "What's first on the agenda?" },
        ],
      },
      {
        name: "Đề nghị & xác nhận",
        vocab: [
          { word: "available", ipa: "/əˈveɪ.lə.bəl/", stress: "a-VAIL-a-ble", meaningVi: "rảnh / có sẵn", exampleEn: "Are you available tomorrow?" },
          { word: "confirm", ipa: "/kənˈfɜːm/", stress: "con-FIRM", meaningVi: "xác nhận", exampleEn: "Can you confirm the booking?" },
          { word: "remind", ipa: "/rɪˈmaɪnd/", stress: "re-MIND", meaningVi: "nhắc", exampleEn: "Remind me to call the client." },
        ],
      },
    ],
  },
  {
    part: 3,
    title: "Part 3 — Hội thoại",
    emoji: "👥",
    format: "39 câu / 13 hội thoại (2–3 người). Mỗi đoạn 3 câu hỏi. Một số đoạn kèm bảng/hình (graphic).",
    overview:
      "ĐỌC TRƯỚC 3 câu hỏi khi audio chưa nói, rồi nghe theo thứ tự — câu hỏi thường theo trình tự hội thoại. Đáp án hay là PARAPHRASE (diễn đạt lại) chứ không lặp nguyên từ.",
    traps: [
      "Paraphrase: nghe 'discount' → đáp 'reduce the price'; nghe 'broken' → 'not working'.",
      "Gán nhầm: thông tin của người nam bị hỏi về người nữ.",
      "Câu hỏi ý định: 'What does the woman mean when she says ...?' — hiểu hàm ý, không dịch sát.",
      "Graphic: câu hỏi yêu cầu nhìn bảng (look at the graphic) — ghép thông tin nghe + bảng.",
    ],
    grammarFocus: [
      { title: "Câu hỏi mục đích/chủ đề", detail: "'Why is the man calling?', 'What are they discussing?' — nghe 2 câu đầu.", exampleEn: "I'm calling about the order I placed last week." },
      { title: "Câu hỏi chi tiết", detail: "What/When/Where/How much — bắt con số, ngày, địa điểm cụ thể.", exampleEn: "The shipment will arrive on Thursday." },
      { title: "Câu hỏi 'next' / đề nghị", detail: "'What will the man probably do next?' — nghe câu cuối ('I'll...', 'Let me...').", exampleEn: "I'll send you the invoice right away." },
    ],
    listeningTips: [
      { title: "Đọc câu hỏi trước", detail: "Gạch keyword trong 3 câu hỏi trước khi audio chạy." },
      { title: "Nghe người đổi vai", detail: "2–3 giọng. Phân biệt nam/nữ để không gán nhầm." },
      { title: "Số & ngày tháng", detail: "Luyện nghe '15 vs 50', 'on the 13th', 'a quarter to nine'." },
    ],
    patterns: [
      "Gist: What is the conversation mainly about?",
      "Purpose: Why is the woman calling?",
      "Detail: What does the man ask for?",
      "Intention: What does the woman imply when she says '...'?",
      "Next action: What will the man do next?",
      "Graphic: Look at the graphic. Which ... will they choose?",
    ],
    themes: [
      {
        name: "Đặt hàng & giao nhận",
        vocab: [
          { word: "shipment", ipa: "/ˈʃɪp.mənt/", stress: "SHIP-ment", meaningVi: "lô hàng", exampleEn: "The shipment is delayed." },
          { word: "invoice", ipa: "/ˈɪn.vɔɪs/", stress: "IN-voice", meaningVi: "hóa đơn", exampleEn: "I'll email you the invoice." },
          { word: "warehouse", ipa: "/ˈweə.haʊs/", stress: "WARE-house", meaningVi: "kho hàng", exampleEn: "It's still in the warehouse." },
        ],
      },
      {
        name: "Họp & dự án",
        vocab: [
          { word: "deadline", ipa: "/ˈded.laɪn/", stress: "DEAD-line", meaningVi: "hạn chót", exampleEn: "We can't miss the deadline." },
          { word: "colleague", ipa: "/ˈkɒl.iːɡ/", stress: "COL-league", meaningVi: "đồng nghiệp", exampleEn: "Ask your colleague in sales." },
          { word: "budget", ipa: "/ˈbʌdʒ.ɪt/", stress: "BUDG-et", meaningVi: "ngân sách", exampleEn: "The budget is tight this quarter." },
        ],
      },
    ],
  },
  {
    part: 4,
    title: "Part 4 — Bài nói (Talks)",
    emoji: "🎙️",
    format: "30 câu / 10 bài nói 1 người (monologue). Mỗi bài 3 câu hỏi. Có thể kèm graphic.",
    overview:
      "Chỉ 1 giọng nói liên tục nên cần tập trung cao. Câu đầu thường lộ NGỮ CẢNH (ai nói, ở đâu): hộp thư thoại, thông báo sân bay/cửa hàng, quảng cáo, dự báo, bài giới thiệu/tham quan.",
    traps: [
      "Bỏ lỡ câu mở đầu = mất ngữ cảnh cho cả 3 câu hỏi.",
      "Quảng cáo: nghe nhầm tên sản phẩm / ưu đãi (số %, ngày kết thúc).",
      "Thông báo: lý do hoãn/đổi cổng, hướng dẫn hành động ('please proceed to gate 5').",
    ],
    grammarFocus: [
      { title: "Nhận diện loại bài nói", detail: "Voicemail ('You've reached...'), Announcement ('Attention, passengers...'), Ad ('Visit us...'), Tour ('Welcome to...').", exampleEn: "Attention passengers, flight 207 is now boarding." },
      { title: "Câu hỏi ngữ cảnh", detail: "'Where is the speaker?', 'Who is the audience?' — suy từ từ khóa.", exampleEn: "Thank you for shopping at Greenmart." },
      { title: "Câu hỏi hành động", detail: "'What are listeners asked to do?' — nghe câu mệnh lệnh cuối bài.", exampleEn: "Please remember to take your belongings." },
    ],
    listeningTips: [
      { title: "Bắt câu đầu tiên", detail: "Quyết định toàn bộ ngữ cảnh. Đừng phân tâm khi câu hỏi mẫu đọc xong là vào ngay." },
      { title: "Từ tín hiệu chuyển ý", detail: "'However', 'Also', 'Finally', 'As a result' báo hiệu câu trả lời sắp tới." },
      { title: "Trọng âm câu (sentence stress)", detail: "Người nói nhấn vào thông tin quan trọng: số, tên, thời gian — bám vào đó." },
    ],
    patterns: [
      "Context: Where most likely is the speaker?",
      "Audience: Who is the message for?",
      "Purpose: What is the purpose of the announcement?",
      "Detail: What problem does the speaker mention?",
      "Request: What are listeners asked to do?",
      "Next: What will happen next / after the talk?",
    ],
    themes: [
      {
        name: "Thông báo công cộng",
        vocab: [
          { word: "announcement", ipa: "/əˈnaʊns.mənt/", stress: "an-NOUNCE-ment", meaningVi: "thông báo", exampleEn: "Please listen to the following announcement." },
          { word: "passenger", ipa: "/ˈpæs.ən.dʒər/", stress: "PAS-sen-ger", meaningVi: "hành khách", exampleEn: "All passengers should board now." },
          { word: "delay", ipa: "/dɪˈleɪ/", stress: "de-LAY", meaningVi: "sự trì hoãn", exampleEn: "The flight has a short delay." },
        ],
      },
      {
        name: "Quảng cáo & sự kiện",
        vocab: [
          { word: "discount", ipa: "/ˈdɪs.kaʊnt/", stress: "DIS-count", meaningVi: "giảm giá", exampleEn: "Get a 20% discount this week." },
          { word: "grand opening", ipa: "/ˌɡrænd ˈəʊ.pən.ɪŋ/", stress: "grand O-pen-ing", meaningVi: "khai trương", exampleEn: "Join our grand opening on Saturday." },
          { word: "register", ipa: "/ˈredʒ.ɪ.stər/", stress: "REG-is-ter", meaningVi: "đăng ký", exampleEn: "Register online to attend." },
        ],
      },
    ],
  },
];

export function getFocusPart(part: number): ListeningFocusPart | undefined {
  return LISTENING_FOCUS.find((p) => p.part === part);
}
