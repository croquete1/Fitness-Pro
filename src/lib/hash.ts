// src/lib/hash.ts
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
export async function checkPassword(password: string, hash: string) {
  try { return await bcrypt.compare(password, hash); }
  catch { return false; }
}
