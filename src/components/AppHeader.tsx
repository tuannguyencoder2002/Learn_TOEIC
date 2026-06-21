"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const desktopLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/practice", label: "Luyện Part 5" },
  { href: "/exams", label: "Đề" },
  { href: "/listening", label: "Listening" },
  { href: "/review", label: "Ôn lại" },
  { href: "/import", label: "Import ảnh" },
  { href: "/vocabulary", label: "Từ vựng" },
  { href: "/settings", label: "Cài đặt" },
];

const mobileTabs = [
  { href: "/", label: "Trang chủ", icon: "🏠" },
  { href: "/practice", label: "Luyện", icon: "✏️" },
  { href: "/exams", label: "Đề", icon: "📋" },
  { href: "/review", label: "Ôn", icon: "🔁" },
  { href: "/import", label: "Import", icon: "📷" },
  { href: "/vocabulary", label: "Từ vựng", icon: "📚" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeader() {
  const pathname = usePathname();

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-border bg-white/95 shadow-sm backdrop-blur-md"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-xs font-bold text-white shadow-md sm:h-10 sm:w-10 sm:text-sm">
              T5
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-brand">Learn TOEIC</p>
              <p className="hidden truncate text-xs text-brand-muted sm:block">Part 5 · Listening · AI</p>
            </div>
          </Link>

          <nav className="hidden gap-1 md:flex">
            {desktopLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-brand text-white"
                      : "text-brand-muted hover:bg-surface hover:text-brand"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/settings"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition md:hidden ${
              isActive(pathname, "/settings")
                ? "border-brand bg-brand text-white"
                : "border-border bg-surface text-brand"
            }`}
            aria-label="Cài đặt"
          >
            ⚙️
          </Link>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 shadow-[0_-4px_20px_rgba(0,30,80,0.08)] backdrop-blur-md md:hidden"
        style={{ paddingBottom: "var(--safe-bottom)" }}
        aria-label="Điều hướng chính"
      >
        <div className="mx-auto grid max-w-lg grid-cols-6">
          {mobileTabs.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative touch-target flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition active:scale-95 ${
                  active ? "text-brand" : "text-brand-muted"
                }`}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {link.icon}
                </span>
                <span className={`truncate ${active ? "font-semibold" : ""}`}>{link.label}</span>
                {active && (
                  <span className="absolute bottom-1 h-0.5 w-8 rounded-full bg-brand" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
