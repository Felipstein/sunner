import * as net from 'node:net';

import chalk from 'chalk';

import { config } from './config';
import { readPacket, readString, readVarInt, toHexString, writeString, writeVarInt } from './utils';

const server = net.createServer();

server.on('connection', (socket) => {
  socket.on('data', (data) => {
    const packet = readPacket(data);

    console.info(
      chalk.gray('Received packet.'),
      `Packet ID: ${toHexString(packet.id)}`,
      chalk.italic(`- ( ${packet.length} bytes )`),
    );

    switch (packet.id) {
      case 0x00: {
        console.log('Handkshake packet.');

        let offset: number;

        const { value: protocolVersion, offset: offsetAfterVersion } = readVarInt(
          data,
          packet.offset,
        );
        offset = offsetAfterVersion;

        const { value: serverAddress, offset: offsetAfterAddress } = readString(data, offset);
        offset = offsetAfterAddress;

        const serverPort = data.readUint16BE(offset);
        offset += 2;

        const { value: nextState, offset: offsetAfterNextState } = readVarInt(data, offset);
        offset = offsetAfterNextState;

        console.info('Protocol info:');
        console.info('\t- Version:', protocolVersion);
        console.info('\t- Address:', serverAddress);
        console.info('\t- Port:', serverPort);
        console.info('\t- NextState:', nextState);

        const responseJson = JSON.stringify({
          version: { name: '1.20.4', protocol: protocolVersion },
          players: { max: 4237423674732, online: -5 },
          description: { text: 'Welcome my friendi' },
        });

        const responseData = writeString(responseJson);
        const packetId = writeVarInt(packet.id);
        const length = writeVarInt(responseData.length + packetId.length);

        const response = Buffer.concat([length, packetId, responseData]);

        socket.write(response);

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
