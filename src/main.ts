import * as net from 'node:net';

import chalk from 'chalk';

import { config } from './config';
import { Packet } from './gateway/core/packet';
import { bitUtils } from './gateway/utils/bit';

const server = net.createServer();

server.on('connection', (socket) => {
  socket.on('data', (data) => {
    const packet = Packet.fromBuffer(data);

    console.info(
      chalk.gray('Received packet.'),
      `Packet ID: ${packet.hexId()}`,
      chalk.italic(`- ( ${packet.length} bytes )`),
    );

    switch (packet.id) {
      case 0x00: {
        console.log('Handshake packet.');

        const { value: protocolVersion, offset: offsetAfterVersion } = bitUtils.readVarInt(
          packet.data,
        );

        const { value: serverAddress, offset: offsetAfterAddress } = bitUtils.readString(
          packet.data,
          offsetAfterVersion,
        );

        const serverPort = packet.data.readUint16BE(offsetAfterAddress);

        const { value: nextState } = bitUtils.readVarInt(packet.data, offsetAfterAddress + 2);

        console.info('Protocol info:');
        console.info('\t- Version:', protocolVersion);
        console.info('\t- Address:', serverAddress);
        console.info('\t- Port:', serverPort);
        console.info('\t- NextState:', nextState);

        const responsePayload = {
          version: { name: '1.20.4', protocol: protocolVersion },
          players: { max: 4237423674732, online: -5 },
          description: { text: 'Welcome my friendi' },
        };
        const responsePacket = Packet.create(packet.id, responsePayload);
        socket.write(responsePacket.toBuffer());

        break;
      }
      case 0x01:
        console.log('Status request packet.');
        break;
      default:
        console.log('Unknown packet.');
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
