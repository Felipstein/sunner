import type { Cipher, Decipher } from 'node:crypto';

export class CipherAndDecipher {
  constructor(
    readonly cipher: Cipher,
    readonly decipher: Decipher,
  ) {}
}
