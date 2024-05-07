import * as net from 'node:net';

import chalk from 'chalk';

import { config } from './config';
import { BufferIterator } from './gateway/core/buffer-iterator';
import { Packet } from './gateway/core/packet';
import { EncryptionRequestPacket } from './gateway/packets/encryption-request.packet';
import { EncryptionResponsePacket } from './gateway/packets/encryption-response.packet';
import { HandshakePacket } from './gateway/packets/handshake.packet';
import { LoginStartPacket } from './gateway/packets/login-start.packet';
import { PingRequestPacket } from './gateway/packets/ping-request.packet';
import { PingResponsePacket } from './gateway/packets/ping-response.packet';
import { StatusResponsePacket } from './gateway/packets/status-response.packet';
import { UnknownPacket } from './gateway/packets/unknown-packet';
import {
  generateVerifyToken,
  generateServerEncryption,
  decryptData,
  convertDerToPem,
} from './gateway/services/encryption-authentication';
import { UUID } from './shared/value-objects/uuid';

const server = net.createServer();

const { serverPublicKey, serverPrivateKey } = generateServerEncryption();

server.on('connection', (socket) => {
  let currentState: 'HANDSHAKING' | 'STATUS' | 'LOGIN' = 'HANDSHAKING';

  let currentVerifyToken: Buffer | null = null;
  let currentUsername: string | null = null;
  let currentUUID: UUID | null = null;

  const sendPacket = (packet: Packet) => {
    console.info(
      chalk.gray('->> Sent packet\t\t'),
      `Packet ID: ${chalk.yellow(packet.hexId())}`,
      '-',
      chalk.green(currentState),
      '-',
      chalk.cyan(packet.constructor.name),
      chalk.italic(`- ( ${packet.totalLength} bytes )`),
    );

    socket.write(packet.toBuffer());
  };

  socket.on('data', (data) => {
    const unknownPacket = UnknownPacket.fromBuffer(data);

    console.info(
      chalk.gray('<<- Received packet\t'),
      `Packet ID: ${chalk.yellow(unknownPacket.hexId())}`,
      '-',
      chalk.green(currentState),
      '-',
      chalk.cyan(unknownPacket.constructor.name),
      chalk.italic(`- ( ${unknownPacket.length} bytes )`),
      unknownPacket.compressed
        ? ` ${chalk.green('++')}compressed ${chalk.italic(` ( ${unknownPacket.totalLength} total bytes ) `)}`
        : '',
    );

    switch (currentState) {
      case 'HANDSHAKING': {
        switch (unknownPacket.id) {
          case 0x00: {
            const packet = HandshakePacket.fromUnknownPacket(unknownPacket);

            if (packet.nextState === 1) {
              const responsePacket = new StatusResponsePacket({
                version: { name: '1.20.4', protocol: packet.protocolVersion },
                players: { max: 100, online: 0 },
                description: { text: 'Welcome my friend!', color: 'gray' },
              });
              sendPacket(responsePacket);

              currentState = 'STATUS';
              break;
            }

            if (packet.nextState === 2) {
              if (unknownPacket.compressed) {
                const compressedPacket = unknownPacket.slice(packet.lastOffset);

                if (compressedPacket.id === 0x00) {
                  const verifyToken = generateVerifyToken();
                  const responsePacket = new EncryptionRequestPacket(serverPublicKey, verifyToken);

                  sendPacket(responsePacket);

                  const loginStartPacket = LoginStartPacket.fromUnknownPacket(compressedPacket);
                  currentVerifyToken = verifyToken;
                  currentUsername = loginStartPacket.name;
                  currentUUID = loginStartPacket.playerUUID;
                }
              }

              currentState = 'LOGIN';
              break;
            }

            throw new Error(`Invalid next state: ${packet.nextState}`);
          }
          default:
        }

        break;
      }
      case 'STATUS': {
        switch (unknownPacket.id) {
          case 0x00: {
            console.log('eita');

            break;
          }
          case 0x01: {
            const pingRequestPacket = PingRequestPacket.fromUnknownPacket(unknownPacket);
            const pingResponsePacket = new PingResponsePacket(pingRequestPacket.payload);

            sendPacket(pingResponsePacket);

            break;
          }
          default:
            console.log('Unknown packet from Status.');
        }

        break;
      }
      case 'LOGIN': {
        switch (unknownPacket.id) {
          case 0x00: {
            const verifyToken = generateVerifyToken();
            const responsePacket = new EncryptionRequestPacket(serverPublicKey, verifyToken);

            sendPacket(responsePacket);

            const loginStartPacket = LoginStartPacket.fromUnknownPacket(unknownPacket);
            currentVerifyToken = verifyToken;
            currentUsername = loginStartPacket.name;
            currentUUID = loginStartPacket.playerUUID;

            break;
          }
          case 0x01: {
            const packet = EncryptionResponsePacket.fromUnknownPacket(unknownPacket);

            // const sharedSecret = decryptData(
            //   packet.sharedSecret,
            //   convertDerToPem(serverPrivateKey, 'private'),
            // );
            // const verifyToken = decryptData(
            //   packet.verifyToken,
            //   convertDerToPem(serverPrivateKey, 'private'),
            // );

            const bufferIterator = new BufferIterator(packet.sharedSecret);

            console.log({
              sharedSecret: bufferIterator.readString(),
              verifyToken: packet.verifyToken,
              currentVerifyToken,
            });

            break;
          }
          default:
            console.log('Unknown packet from Login.');
        }

        break;
      }
      default:
        throw new Error(`Invalid current state: ${currentState}`);
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
