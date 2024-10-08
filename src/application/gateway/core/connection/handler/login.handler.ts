import chalk from 'chalk';

import { ConnectionState } from '@gateway/@types/connection-state';
import { CoreServer } from '@gateway/core/core-server';
import { UnknownPacket } from '@gateway/core/unknown-packet';
import { EncryptionRequestPacket } from '@gateway/packets/encryption-request.packet';
import { EncryptionResponsePacket } from '@gateway/packets/encryption-response.packet';
import { LoginStartPacket } from '@gateway/packets/login-start.packet';
import { LoginSuccessPacket } from '@gateway/packets/login-success.packet';
import { EncryptionAuthenticationService } from '@gateway/services/encryption-authentication';
import { Logger } from '@infra/logger';

import { Connection } from '..';
import { EncryptionStage } from '../encryption-stage';

import { ConnectionHandler } from '.';

const log = Logger.init('LOGIN_CONNECTION_HANDLER');

export class LoginConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.LOGIN, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket) {
    switch (unknownPacket.id) {
      case 0x00: {
        const loginStartPacket = LoginStartPacket.fromUnknownPacket(unknownPacket);
        const verifyToken = EncryptionAuthenticationService.generateVerifyToken();

        this.sendEncryptionRequest(verifyToken);
        this.onLoginStart(loginStartPacket, verifyToken);
        break;
      }
      case 0x01: {
        this.onEncryptionResponse(unknownPacket);
        break;
      }
      case 0x03: {
        // Login Acknowledged Packet
        this.connection.changeState(ConnectionState.CONFIGURATION);
        break;
      }
      default: {
        log.warn(`Unknown packet from ${this.constructor.name} ${unknownPacket.hexId()}`);
      }
    }
  }

  private sendEncryptionRequest(verifyToken: Buffer) {
    const encryptionRequestPacket = new EncryptionRequestPacket(
      CoreServer.singleton.encryptionKeys.publicKey,
      verifyToken,
    );
    this.reply(encryptionRequestPacket);
  }

  private onLoginStart(loginStartPacket: LoginStartPacket, verifyToken: Buffer) {
    this.connection.encryptionStage = new EncryptionStage({
      verifyToken,
      username: loginStartPacket.name,
      playerUUID: loginStartPacket.playerUUID,
    });
  }

  private onEncryptionResponse(unknownPacket: UnknownPacket) {
    if (!this.connection.encryptionStage) {
      throw new Error(`You client loses some important packets, try again.`);
    }

    const { encryptionStage } = this.connection;

    const encryptionResponsePacket = EncryptionResponsePacket.fromUnknownPacket(unknownPacket);

    const sharedSecret = this.validateClientEncryption(
      encryptionResponsePacket.verifyToken,
      encryptionResponsePacket.sharedSecret,
    );

    log.debug(chalk.blue('Enabling cryptography.'));

    this.connection.encryptionStage.enableEncryption(sharedSecret);

    const loginSuccessPacket = new LoginSuccessPacket(
      encryptionStage.playerUUID,
      encryptionStage.username,
      [{ name: 'Felipe', value: 'oloco', isSigned: true, signature: 'eita' }],
    );

    this.reply(loginSuccessPacket);
  }

  private validateClientEncryption(verifyTokenEncrypted: Buffer, sharedSecretEncrypted: Buffer) {
    const encryptionStage = this.connection.encryptionStage!;

    try {
      const privateKeyPem = EncryptionAuthenticationService.convertDerToPem(
        CoreServer.singleton.encryptionKeys.privateKey,
        'private',
      );

      const verifyToken = EncryptionAuthenticationService.decryptData(
        verifyTokenEncrypted,
        privateKeyPem,
      );
      if (!verifyToken.equals(encryptionStage.verifyToken)) {
        throw new Error('invalid_verify_token');
      }

      log.debug(
        chalk.blue(
          `User ${encryptionStage.username} passed the encryption verification. (UUID: ${encryptionStage.playerUUID.toString()})`,
        ),
      );

      const sharedSecret = EncryptionAuthenticationService.decryptData(
        sharedSecretEncrypted,
        privateKeyPem,
      );

      return sharedSecret;
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'invalid_verify_token') {
        throw error;
      }

      log.error(chalk.red(error));

      throw new Error('Invalid token encrypted.');
    }
  }
}
