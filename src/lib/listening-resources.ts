export interface ListeningResource {
  id: string;
  title: string;
  provider: string;
  description: string;
  href: string;
  parts: string;
  free: boolean;
  hasAudio: boolean;
}

/** Nguồn luyện Listening hợp pháp — link ra trang chính thức, không crawl. */
export const OFFICIAL_LISTENING_RESOURCES: ListeningResource[] = [
  {
    id: "ets-prepare",
    title: "ETS Sample Tests (PDF)",
    provider: "ETS",
    description:
      "Bộ đề mẫu Listening & Reading chính thức. Tải PDF, nghe audio theo hướng dẫn trong tài liệu.",
    href: "https://www.ets.org/toeic/test-takers/prepare.html",
    parts: "Part 1–4 + Reading",
    free: true,
    hasAudio: true,
  },
  {
    id: "iibc-part2",
    title: "Sample Part 2 (audio trên web)",
    provider: "IIBC / TOEIC Japan",
    description: "Câu hỏi–đáp lại ngắn, có nút phát audio trực tiếp trên trang.",
    href: "https://www.iibc-global.org/toeic/test/lr/about/format/sample02.html",
    parts: "Part 2",
    free: true,
    hasAudio: true,
  },
  {
    id: "iibc-part3",
    title: "Sample Part 3 (audio trên web)",
    provider: "IIBC / TOEIC Japan",
    description: "Hội thoại ngắn + 3 câu hỏi mỗi đoạn, audio nhúng trên trang.",
    href: "https://www.iibc-global.org/toeic/test/lr/about/format/sample03.html",
    parts: "Part 3",
    free: true,
    hasAudio: true,
  },
  {
    id: "ets-global",
    title: "ETS Global – Sample + OLPC",
    provider: "ETS Global",
    description: "Thông tin đề mẫu và khóa OLPC chính thức (một phần có phí).",
    href: "https://www.etsglobal.org/",
    parts: "Listening L&R",
    free: true,
    hasAudio: true,
  },
  {
    id: "iig-practice",
    title: "IIG Vietnam – Đề thi thử",
    provider: "IIG Vietnam",
    description: "Đề thử L&R mô phỏng thi thật. Có thể cần đăng ký tài khoản.",
    href: "https://iigvietnam.com/practice/de-thi-thu-toeic/",
    parts: "Full L&R",
    free: true,
    hasAudio: true,
  },
  {
    id: "bbc",
    title: "BBC Learning English",
    provider: "BBC",
    description: "Luyện nghe + transcript miễn phí. Format khác TOEIC nhưng tốt cho nền tảng.",
    href: "https://www.bbc.co.uk/learningenglish",
    parts: "General listening",
    free: true,
    hasAudio: true,
  },
  {
    id: "voa",
    title: "VOA Learning English",
    provider: "VOA",
    description: "Tin tức tiếng Anh chậm, có script. Miễn phí, không cần đăng ký.",
    href: "https://learningenglish.voanews.com/",
    parts: "General listening",
    free: true,
    hasAudio: true,
  },
];
