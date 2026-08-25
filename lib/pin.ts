import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SECRET = process.env.COOKIE_SECRET ?? "dev-secret-must-change-in-production";

// ─── Hashing del PIN (scrypt con sal aleatoria) ───────────────────────────────

export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPin(pin: string, storedHash: string): boolean {
  const colonIdx = storedHash.indexOf(":");
  if (colonIdx === -1) return false;
  const salt = storedHash.slice(0, colonIdx);
  const hash = storedHash.slice(colonIdx + 1);
  try {
    const derived = scryptSync(pin, salt, 32).toString("hex");
    // Ambos buffers son siempre 64 bytes hex → misma longitud garantizada
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
  } catch {
    return false;
  }
}

// ─── Firma HMAC-SHA256 para cookies ──────────────────────────────────────────

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function splitToken(token: string): [string, string] | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  return [token.slice(0, dot), token.slice(dot + 1)];
}

function verifySignature(payload: string, sig: string): boolean {
  const expected = sign(payload);
  const bufSig = Buffer.from(sig, "base64url");
  const bufExp = Buffer.from(expected, "base64url");
  if (bufSig.length !== bufExp.length) return false;
  return timingSafeEqual(bufSig, bufExp);
}

// ─── Cookie de acceso al álbum (24 h) ────────────────────────────────────────

export const ACCESS_COOKIE_PREFIX = "pin_access_";
const ACCESS_TTL_MS = 24 * 60 * 60 * 1000;

export function createAccessToken(albumId: string): string {
  const exp = Date.now() + ACCESS_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ albumId, exp })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAccessToken(token: string, albumId: string): boolean {
  const parts = splitToken(token);
  if (!parts) return false;
  const [payload, sig] = parts;
  if (!verifySignature(payload, sig)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      albumId: string;
      exp: number;
    };
    return data.albumId === albumId && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

// ─── Cookie de intentos fallidos (por sesión) ─────────────────────────────────

export const TRIES_COOKIE_PREFIX = "pin_tries_";
export const MAX_PIN_ATTEMPTS = 2;

export function createTriesToken(slug: string, count: number): string {
  const payload = Buffer.from(JSON.stringify({ slug, count })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readTriesToken(token: string, slug: string): number {
  const parts = splitToken(token);
  if (!parts) return 0;
  const [payload, sig] = parts;
  if (!verifySignature(payload, sig)) return 0;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      slug: string;
      count: number;
    };
    if (data.slug !== slug || typeof data.count !== "number") return 0;
    return data.count;
  } catch {
    return 0;
  }
}
