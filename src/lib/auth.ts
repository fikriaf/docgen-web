const SALT = "docgen_history_salt_2026";

const HASHED_PASSWORD = "47d5b6bb925eb195a878d4a7b745b0b85178e8c2e121c02cbce0934d30c51049";

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(SALT + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === HASHED_PASSWORD;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("history_auth") === "true";
}

export function setAuthenticated(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    sessionStorage.setItem("history_auth", "true");
  } else {
    sessionStorage.removeItem("history_auth");
  }
}
