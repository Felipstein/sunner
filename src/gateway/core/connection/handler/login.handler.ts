import chalk from 'chalk';

import { Connection } from '..';
import { serverKeys } from '../../../../main';
import { ConnectionState } from '../../../@types/connection-state';
import { EncryptionRequestPacket } from '../../../packets/encryption-request.packet';
import { EncryptionResponsePacket } from '../../../packets/encryption-response.packet';
import { LoginStartPacket } from '../../../packets/login-start.packet';
import { UnknownPacket } from '../../../packets/unknown-packet';
import { EncryptionAuthenticationService } from '../../../services/encryption-authentication';
import { EncryptionStage } from '../encryption-stage';

import { ConnectionHandler, Reply } from '.';

export class LoginConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.LOGIN, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket, reply: Reply) {
    switch (unknownPacket.id) {
      case 0x00: {
        const loginStartPacket = LoginStartPacket.fromUnknownPacket(unknownPacket);
        const verifyToken = EncryptionAuthenticationService.generateVerifyToken();

        this.sendEncryptionRequest(verifyToken, reply);
        this.onLoginStart(loginStartPacket, verifyToken);
        break;
      }
      case 0x01: {
        this.onEncryptionResponse(unknownPacket);
        break;
      }
      default: {
        console.log(`Unknown packet from ${this.constructor.name} ${unknownPacket.hexId()}`);
      }
    }
  }

  private sendEncryptionRequest(verifyToken: Buffer, reply: Reply) {
    const encryptionRequestPacket = new EncryptionRequestPacket(serverKeys.publicKey, verifyToken);
    reply(encryptionRequestPacket);
  }

  private onLoginStart(loginStartPacket: LoginStartPacket, verifyToken: Buffer) {
    this.connection.encryptionStage = new EncryptionStage({
      verifyToken,
      username: loginStartPacket.name,
      playerUUID: loginStartPacket.playerUUID,
    });
  }

  private onEncryptionResponse(unknownPacket: UnknownPacket) {
    const { encryptionStage } = this.connection;

    if (!encryptionStage) {
      throw new Error(`You client loses some important packets, try again.`);
    }

    const encryptionResponsePacket = EncryptionResponsePacket.fromUnknownPacket(unknownPacket);
    const privateKeyPem = EncryptionAuthenticationService.convertDerToPem(
      serverKeys.privateKey,
      'private',
    );

    try {
      const verifyToken = EncryptionAuthenticationService.decryptData(
        encryptionResponsePacket.verifyToken,
        privateKeyPem,
      );
      if (!verifyToken.equals(encryptionStage.verifyToken)) {
        throw new Error('Invalid verify token.');
      }

      console.info(
        chalk.blue(
          `User ${encryptionStage.username} passed the encryption verification. (UUID: ${encryptionStage.playerUUID.value})`,
        ),
      );

      const sharedSecret = EncryptionAuthenticationService.decryptData(
        encryptionResponsePacket.sharedSecret,
        privateKeyPem,
      );

      console.info(chalk.blue('Enabling cryptography.'));

      const { cipher, decipher } =
        EncryptionAuthenticationService.createCipherAndDecipher(sharedSecret);
    } catch {
      throw new Error('Invalid token encrypted.');
    }
  }
}
