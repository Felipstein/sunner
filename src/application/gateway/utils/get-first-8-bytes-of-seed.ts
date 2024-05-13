import crypto from 'node:crypto';

export function getFirst8BytesOfSeed(seed: bigint) {
  const hash = crypto.createHash('sha256').update(seed.toString()).digest();
  const first8Bytes = hash.subarray(0, 8);
  const hashedSeed = first8Bytes.readBigInt64BE();

  return hashedSeed;
}
