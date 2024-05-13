import { KeyPairSyncResult } from 'node:crypto';

import chalk from 'chalk';

import { EncryptionAuthenticationService } from '@gateway/services/encryption-authentication';
import { decompressPacket } from '@gateway/utils/decompress-packet';
import { Logger } from '@infra/logger';
import { loggers } from '@infra/logger/constants';

import { Connection } from './connection';
import { UnknownPacket } from './unknown-packet';

const log = Logger.init();

export abstract class CoreServer {
  private static instance: CoreServer;

  private readonly entityIds = new Set<number>();
  private lastEntityId = 0;

  readonly encryptionKeys: KeyPairSyncResult<Buffer, Buffer>;

  constructor() {
    this.encryptionKeys = EncryptionAuthenticationService.generateKeyPair();
    CoreServer.instance = this;
  }

  generateEntityId() {
    let newId = this.lastEntityId + 1;

    while (this.entityIds.has(newId)) {
      newId += 1;
    }

    this.entityIds.add(newId);
    this.lastEntityId = newId;

    return newId;
  }

  releaseEntityId(id: number) {
    this.entityIds.delete(id);
  }

  protected onError(error: Error) {
    loggers.server.fatal(error);
  }

  protected onConnect(connection: Connection) {
    connection.onData((encryptedData) => {
      const decipher = connection.encryptionStage?.security?.decipher;
      const data = decipher ? decipher.update(encryptedData) : encryptedData;

      const unknownPacket = UnknownPacket.fromBuffer(data);

      log.debugPacket(
        chalk.gray(`<<- Received packet${decipher ? chalk.blue('*') : ''}\t`),
        `Packet ID: ${chalk.yellow(unknownPacket.hexId())}`,
        '-',
        chalk.green(connection.state),
        '-',
        chalk.cyan(unknownPacket.constructor.name),
        chalk.italic(`- ( ${unknownPacket.length} bytes )`),
        unknownPacket.compressed
          ? ` ${chalk.green('++')}compressed ${chalk.italic(` ( ${unknownPacket.totalLength} total bytes ) `)}`
          : '',
      );

      if (unknownPacket.compressed) {
        decompressPacket(unknownPacket, (decompressedPacket) => {
          log.debugPacket(
            chalk.gray(`<<- Received packet${decipher ? chalk.blue('*') : ''}${chalk.red('*')}\t`),
            `Packet ID: ${chalk.yellow(unknownPacket.hexId())}`,
            '-',
            chalk.green(connection.state),
            '-',
            chalk.cyan(unknownPacket.constructor.name),
            chalk.italic(`- ( ${unknownPacket.length} bytes )`),
            unknownPacket.compressed ? ` ${chalk.red('--')}decompressed` : '',
          );

          connection.handler.onArrivalPacket(decompressedPacket);
        });
      } else {
        connection.handler.onArrivalPacket(unknownPacket);
      }
    });
  }

  abstract init(): Promise<{ hostname: string; port: number }>;

  static get singleton() {
    return this.instance;
  }
}
