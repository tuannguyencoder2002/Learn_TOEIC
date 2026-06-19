/**
 * Đọc JSON body theo UTF-8 thủ công.
 *
 * Lý do: trên môi trường Next.js dev (Windows) ở máy này, `request.json()` giải mã
 * sai ký tự đa byte (tiếng Việt → ký tự thay thế U+FFFD). Đọc qua arrayBuffer rồi
 * TextDecoder('utf-8') cho kết quả đúng. Dùng cho mọi route nhận tiếng Việt.
 */
export async function readJsonBody<T = Record<string, unknown>>(
  request: Request
): Promise<T> {
  const buf = await request.arrayBuffer();
  const text = new TextDecoder("utf-8").decode(buf);
  return (text ? JSON.parse(text) : {}) as T;
}
