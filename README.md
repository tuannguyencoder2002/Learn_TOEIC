# Learn TOEIC

Ứng dụng ôn **TOEIC Part 5** (Incomplete Sentences) với AI Cursor, SRS ôn tập, import ảnh sách, từ vựng và Listening (link nguồn free).

## Yêu cầu

- **Node.js** 20+ — [nodejs.org](https://nodejs.org)
- **PostgreSQL** 14+ — user `postgres`, mật khẩu mặc định trong `.env.example` là `tttt2002`, port `5432`
- **Cursor API key** (tùy chọn) — cho import ảnh AI và tạo đề mới

## Cài đặt (máy mới — sau `git clone`)

```bat
setup.bat
start.bat
```

`setup.bat` sẽ:

1. `npm install`
2. Tạo `.env.local` từ `.env.example` (nếu chưa có)
3. Tạo database `learn_toeic` + chạy schema SQL

Mở trình duyệt: **http://localhost:4001**

## Đẩy lên GitHub (lần đầu)

Trong PowerShell tại thư mục project:

```bat
gh auth login
gh repo create Learn_TOEIC --public --source=. --remote=origin --push --description "TOEIC Part 5 - AI import, SRS, vocabulary"
```

Repo: **https://github.com/tuannguyencoder2002/Learn_TOEIC**

## Cấu hình

Chỉnh file `.env.local` (không commit lên git):

```env
DATABASE_URL=postgresql://postgres:tttt2002@localhost:5432/learn_toeic
CURSOR_API_KEY=crsr_...
CURSOR_MODEL=auto
```

Nếu PostgreSQL dùng port khác (vd. `5434`), sửa trong `DATABASE_URL`.

## Tính năng

| Trang | Mô tả |
|-------|--------|
| `/practice` | Luyện Part 5 — marathon 50–70 câu, AI tạo đề |
| `/import` | Import ảnh sách → AI vision → lưu DB |
| `/review` | Ôn tập SRS (spaced repetition) |
| `/vocabulary` | Từ vựng band 650 kiểu Duolingo |
| `/listening` | Link nguồn Listening free + Part 1 mẫu |

## Điện thoại (cùng WiFi)

`start.bat` in URL dạng `http://192.168.x.x:4001` — mở trên điện thoại cùng mạng LAN.

## Cấu trúc

```
setup.bat          # Cài lần đầu
start.bat          # Chạy dev server
database/          # SQL schema + seed
src/               # Next.js app
scripts/setup-db.js
```

## License

MIT — dùng cho mục đích học tập cá nhân. Không phân phối đề TOEIC có bản quyền.
