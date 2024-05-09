import * as net from 'node:net';
import path from 'node:path';

import chalk from 'chalk';

import { config } from './config';
import { Connection } from './gateway/core/connection';
import { UnknownPacket } from './gateway/packets/unknown-packet';
import { EncryptionAuthenticationService } from './gateway/services/encryption-authentication';
import { decompressPacket } from './gateway/utils/decompress-packet';

export const worldDir = path.resolve('tmp', 'saves', 'world');

const server = net.createServer();
export const serverKeys = EncryptionAuthenticationService.generateKeyPair();

server.on('connection', (socket) => {
  const connection = new Connection(socket);

  socket.on('data', (encryptedData) => {
    const decipher = connection.encryptionStage?.security?.decipher;
    const data = decipher ? decipher.update(encryptedData) : encryptedData;

    const unknownPacket = UnknownPacket.fromBuffer(data);

    console.info(
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
        console.info(
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
});

server.on('error', (error) => {
  throw error;
});

server.listen(config.port, config.hostname);
server.once('listening', () =>
  console.info(
    chalk.gray('Server is running on'),
    chalk.cyan.underline(`${config.hostname}:${config.port}`),
    '\n',
  ),
);
