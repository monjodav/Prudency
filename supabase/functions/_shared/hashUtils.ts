export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);

  if (bufA.byteLength !== bufB.byteLength) {
    // Compare with self to maintain constant time even on length mismatch
    await crypto.subtle.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.subtle.timingSafeEqual(bufA, bufB);
}
