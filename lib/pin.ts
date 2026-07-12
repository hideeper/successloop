// 4자리 PIN을 사용자 ID로 솔팅해 SHA-256 해시로 변환 (클라이언트 계산, profiles.pin_hash 저장용).
export async function hashPin(pin: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
