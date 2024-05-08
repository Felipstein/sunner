import { Connection } from '..';
import { serverKeys } from '../../../../main';
import { ConnectionState } from '../../../@types/connection-state';
import { EncryptionRequestPacket } from '../../../packets/encryption-request.packet';
import { HandshakePacket } from '../../../packets/handshake.packet';
import { LoginStartPacket } from '../../../packets/login-start.packet';
import { StatusResponsePacket } from '../../../packets/status-response.packet';
import { UnknownPacket } from '../../../packets/unknown-packet';
import { getMCVersionByProtocol, ProtocolVersion } from '../../../protocol-version';
import { EncryptionAuthenticationService } from '../../../services/encryption-authentication';
import { EncryptionStage } from '../encryption-stage';

import { ConnectionHandler } from '.';

export class HandshakingConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.HANDSHAKING, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket) {
    switch (unknownPacket.id) {
      case 0x00: {
        const handshakePacket = HandshakePacket.fromUnknownPacket(unknownPacket);

        if (handshakePacket.nextState === 1) {
          this.onReturnServerStatus();
          this.connection.changeState(ConnectionState.STATUS);
          break;
        }

        if (handshakePacket.nextState === 2) {
          this.checkIfHasLoginStartPacketCompressed(unknownPacket, handshakePacket.lastOffset);
          this.connection.changeState(ConnectionState.LOGIN);
          break;
        }

        throw new Error(`Invalid next state: ${handshakePacket.nextState}`);
      }
      default: {
        console.log(`Unknown packet from ${this.constructor.name} ${unknownPacket.hexId()}`);
      }
    }
  }

  private onReturnServerStatus() {
    const protocolVersion = ProtocolVersion.V1_20_4;
    const statusResponsePacket = new StatusResponsePacket({
      version: { name: getMCVersionByProtocol(protocolVersion), protocol: protocolVersion },
      players: { max: 100, online: 0 },
      description: { text: 'Welcome my friend!', color: 'red' },
    });

    this.reply(statusResponsePacket);
  }

  private checkIfHasLoginStartPacketCompressed(unknownPacket: UnknownPacket, lastHSOffset: number) {
    if (unknownPacket.compressed) {
      const compressedPacket = unknownPacket.slice(lastHSOffset);

      if (compressedPacket.id === 0x00) {
        const verifyToken = EncryptionAuthenticationService.generateVerifyToken();
        const encryptionRequestPacket = new EncryptionRequestPacket(
          serverKeys.publicKey,
          verifyToken,
        );

        this.reply(encryptionRequestPacket);

        const loginStartPacket = LoginStartPacket.fromUnknownPacket(compressedPacket);
        this.connection.encryptionStage = new EncryptionStage({
          verifyToken,
          username: loginStartPacket.name,
          playerUUID: loginStartPacket.playerUUID,
        });
      }
    }
  }
}
