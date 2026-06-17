import Link from "next/link";

const features = [
  {
    title: "Part 5 - Dạng từ",
    desc: "Luyện chọn đúng danh từ, động từ, tính từ, trạng từ trong câu business English.",
    href: "/practice?quiz=seed",
  },
  {
    title: "AI tạo đề mới",
    desc: "Dùng Cursor API để sinh đề theo chủ đề, độ khó và loại câu hỏi bạn chọn.",
    href: "/practice?mode=generate",
  },
  {
    title: "Listening (nguồn free)",
    desc: "Link ETS, IIG, BBC và Part 1 mẫu với ảnh stock — luyện mô tả tranh.",
    href: "/listening",
  },
  {
    title: "Từ vựng & giải thích",
    desc: "Mỗi câu có giải thích tiếng Việt và danh sách từ mới để ôn lại.",
    href: "/vocabulary",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-6 sm:space-y-10">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:rounded-3xl sm:p-8 md:p-12">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent sm:mb-3 sm:text-sm">
          TOEIC Part 5
        </p>
        <h1 className="max-w-3xl text-2xl font-bold leading-tight text-brand sm:text-3xl md:text-5xl">
          Ôn luyện Incomplete Sentences với AI Cursor
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-muted sm:mt-4 sm:text-base">
          Luyện dạng từ, ngữ pháp, từ vựng và cụm danh từ theo chuẩn TOEIC. App có sẵn
          13 câu mẫu từ sách và có thể tạo đề mới bằng API key Cursor của bạn.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
          <Link
            href="/practice?quiz=seed"
            className="touch-target flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-light"
          >
            Bắt đầu luyện ngay
          </Link>
          <Link
            href="/settings"
            className="touch-target flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-medium text-brand transition hover:border-brand hover:bg-white"
          >
            Cấu hình API & Model
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:border-accent/40 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-brand group-hover:text-accent">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">{feature.desc}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-brand">Các dạng Part 5 được hỗ trợ</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "Word Forms (N/V/Adj/Adv)",
            "Ngữ pháp",
            "Từ vựng",
            "Collocation",
            "Giải thích tiếng Việt",
            "Chọn Model AI",
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-brand-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
