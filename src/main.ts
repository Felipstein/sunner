import * as net from 'node:net';

import chalk from 'chalk';

import { config } from './config';
import { Connection } from './gateway/core/connection';
import { UnknownPacket } from './gateway/packets/unknown-packet';
import { EncryptionAuthenticationService } from './gateway/services/encryption-authentication';

const server = net.createServer();
export const serverKeys = EncryptionAuthenticationService.generateKeyPair();

server.on('connection', (socket) => {
  const connection = new Connection(socket);

  socket.on('data', (data) => {
    const unknownPacket = UnknownPacket.fromBuffer(data);

    console.info(
      chalk.gray('<<- Received packet\t'),
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

    connection.handler.onArrivalPacket(unknownPacket, connection.sendPacket.bind(connection));
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
