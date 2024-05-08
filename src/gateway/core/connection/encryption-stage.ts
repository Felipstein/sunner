import { UUID } from '../../../shared/value-objects/uuid';

interface EncryptionStageBuilder {
  verifyToken: Buffer;
  username: string;
  playerUUID: UUID;
}

export class EncryptionStage {
  readonly verifyToken: Buffer;
  readonly username: string;
  readonly playerUUID: UUID;

  constructor(builder: EncryptionStageBuilder) {
    this.verifyToken = builder.verifyToken;
    this.username = builder.username;
    this.playerUUID = builder.playerUUID;
  }
}
