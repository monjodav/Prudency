import * as SecureStore from 'expo-secure-store';

const ENCRYPTION_KEY_ALIAS = 'prudency_note_encryption_key';
const IV_LENGTH = 12;
const ALGORITHM = 'AES-GCM';

async function getOrCreateKey(): Promise<CryptoKey> {
  try {
    const stored = await SecureStore.getItemAsync(ENCRYPTION_KEY_ALIAS);

    if (stored) {
      const keyData = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
      return await crypto.subtle.importKey('raw', keyData, ALGORITHM, false, [
        'encrypt',
        'decrypt',
      ]);
    }

    const key = await crypto.subtle.generateKey(
      { name: ALGORITHM, length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );

    const exported = await crypto.subtle.exportKey('raw', key);
    const encoded = btoa(String.fromCharCode(...new Uint8Array(exported)));
    await SecureStore.setItemAsync(ENCRYPTION_KEY_ALIAS, encoded);

    return key;
  } catch (error) {
    throw new Error(
      `Failed to initialize encryption key: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function encryptContent(plaintext: string): Promise<string> {
  try {
    const key = await getOrCreateKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertext = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encoded,
    );

    const combined = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), IV_LENGTH);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    throw new Error(
      `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function decryptContent(encrypted: string): Promise<string> {
  try {
    const key = await getOrCreateKey();
    const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));

    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext,
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
