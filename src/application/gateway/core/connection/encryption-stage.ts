import crypto from 'node:crypto';

import { UUID } from '../../../domain/value-objects/uuid';

import { CipherAndDecipher } from './cipher-and-decipher';

interface EncryptionStageBuilder {
  verifyToken: Buffer;
  username: string;
  playerUUID: UUID;
}

export class EncryptionStage {
  readonly verifyToken: Buffer;
  readonly username: string;
  readonly playerUUID: UUID;

  private _security: CipherAndDecipher | null;

  constructor(builder: EncryptionStageBuilder) {
    this.verifyToken = builder.verifyToken;
    this.username = builder.username;
    this.playerUUID = builder.playerUUID;
    this._security = null;
  }

  get security() {
    return this._security;
  }

  isEncryptionEnabled() {
    return !!this._security;
  }

  enableEncryption(sharedSecret: Buffer) {
    if (this._security) {
      throw new Error(`Cryptography is already enabled for ${this.username} connection.`);
    }

    const cipher = crypto.createCipheriv(
      'aes-128-cfb8',
      sharedSecret,
      sharedSecret.subarray(0, 16),
    );

    const decipher = crypto.createDecipheriv(
      'aes-128-cfb8',
      sharedSecret,
      sharedSecret.subarray(0, 16),
    );

    this._security = new CipherAndDecipher(cipher, decipher);
  }
}
