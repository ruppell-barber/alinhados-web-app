import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32;
const IV_BYTES = 12;

function getKey(): Buffer {
  const hex = process.env.DOCUMENTO_ENCRYPTION_KEY ?? '';
  if (hex.length !== KEY_BYTES * 2) {
    throw new Error('DOCUMENTO_ENCRYPTION_KEY deve ser 64 caracteres hex (32 bytes). Gere com: openssl rand -hex 32');
  }
  return Buffer.from(hex, 'hex');
}

// Formato armazenado: "<iv_hex>.<ciphertext_hex>.<tag_hex>"
export function encryptDocumento(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}.${enc.toString('hex')}.${tag.toString('hex')}`;
}

export function decryptDocumento(stored: string): string {
  const key = getKey();
  const [ivHex, encHex, tagHex] = stored.split('.');
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return decipher.update(Buffer.from(encHex, 'hex')).toString('utf8') + decipher.final('utf8');
}
