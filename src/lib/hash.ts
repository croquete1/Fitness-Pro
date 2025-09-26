// src/lib/hash.ts
import bcrypt from 'bcryptjs';

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

export async function checkPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
