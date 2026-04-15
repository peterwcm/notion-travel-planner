function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

function toBase64Url(input: Uint8Array | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  const value = btoa(binary);

  return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function sign(value: string, secret: Uint8Array) {
  const rawKey = Uint8Array.from(secret);
  const key = await crypto.subtle.importKey("raw", rawKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(signature));
}

export async function createSessionToken() {
  const secret = getSecret();
  if (!secret) {
    throw new Error("Missing required environment variable: SESSION_SECRET");
  }

  const payload = JSON.stringify({
    scope: "travel-planner",
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });

  const encodedPayload = toBase64Url(payload);
  const signature = await sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export async function hasValidSessionToken(token?: string) {
  const secret = getSecret();
  if (!secret || !token) {
    return false;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return false;
  }

  const expected = await sign(encodedPayload, secret);
  if (expected !== signature) {
    return false;
  }

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload))) as {
      exp?: number;
      scope?: string;
    };

    return payload.scope === "travel-planner" && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
