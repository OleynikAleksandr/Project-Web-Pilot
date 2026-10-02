import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';

export async function sha256File(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

// Runtime discovery tolerates access errors; cleanup must surface them.
export async function exists(file, { strict = false } = {}) {
  try { await fs.access(file); return true; }
  catch (error) { if (strict && error.code !== 'ENOENT') throw error; return false; }
}

export const fail = (code, message) => Object.assign(new Error(message), { code });
