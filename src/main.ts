import * as net from 'node:net';

import chalk from 'chalk';

import { config } from './config';
import { Connection } from './gateway/core/connection';
import { UnknownPacket } from './gateway/packets/unknown-packet';

const server = net.createServer();

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

    connection.handler.onArrivalPacket(unknownPacket, connection.sendPacket);

    // switch (currentState) {
    //   case 'HANDSHAKING': {
    //     switch (unknownPacket.id) {
    //       case 0x00: {
    //         const packet = HandshakePacket.fromUnknownPacket(unknownPacket);

    //         if (packet.nextState === 1) {
    //           const responsePacket = new StatusResponsePacket({
    //             version: { name: '1.20.4', protocol: packet.protocolVersion },
    //             players: { max: 100, online: 0 },
    //             description: { text: 'Welcome my friend!', color: 'gray' },
    //           });
    //           sendPacket(responsePacket);

    //           currentState = 'STATUS';
    //           break;
    //         }

    //         if (packet.nextState === 2) {
    //           if (unknownPacket.compressed) {
    //             const compressedPacket = unknownPacket.slice(packet.lastOffset);

    //             if (compressedPacket.id === 0x00) {
    //               const verifyToken = EncryptionAuthenticationService.generateVerifyToken();
    //               const responsePacket = new EncryptionRequestPacket(serverPublicKey, verifyToken);

    //               sendPacket(responsePacket);

    //               const loginStartPacket = LoginStartPacket.fromUnknownPacket(compressedPacket);
    //               currentVerifyToken = verifyToken;
    //               currentUsername = loginStartPacket.name;
    //               currentUUID = loginStartPacket.playerUUID;
    //             }
    //           }

    //           currentState = 'LOGIN';
    //           break;
    //         }

    //         throw new Error(`Invalid next state: ${packet.nextState}`);
    //       }
    //       default:
    //     }

    //     break;
    //   }
    //   case 'STATUS': {
    //     switch (unknownPacket.id) {
    //       case 0x00: {
    //         console.log('eita');

    //         break;
    //       }
    //       case 0x01: {
    //         const pingRequestPacket = PingRequestPacket.fromUnknownPacket(unknownPacket);
    //         const pingResponsePacket = new PingResponsePacket(pingRequestPacket.payload);

    //         sendPacket(pingResponsePacket);

    //         break;
    //       }
    //       default:
    //         console.log('Unknown packet from Status.');
    //     }

    //     break;
    //   }
    //   case 'LOGIN': {
    //     switch (unknownPacket.id) {
    //       case 0x00: {
    //         const verifyToken = EncryptionAuthenticationService.generateVerifyToken();
    //         const responsePacket = new EncryptionRequestPacket(serverPublicKey, verifyToken);

    //         sendPacket(responsePacket);

    //         const loginStartPacket = LoginStartPacket.fromUnknownPacket(unknownPacket);
    //         currentVerifyToken = verifyToken;
    //         currentUsername = loginStartPacket.name;
    //         currentUUID = loginStartPacket.playerUUID;

    //         break;
    //       }
    //       case 0x01: {
    //         if (!currentVerifyToken) {
    //           throw new Error('You client loses some important packets, try again.');
    //         }

    //         const packet = EncryptionResponsePacket.fromUnknownPacket(unknownPacket);

    //         try {
    //           const privateKeyPem = EncryptionAuthenticationService.convertDerToPem(
    //             serverPrivateKey,
    //             'private',
    //           );

    //           const verifyToken = EncryptionAuthenticationService.decryptData(
    //             packet.verifyToken,
    //             privateKeyPem,
    //           );
    //           if (!verifyToken.equals(currentVerifyToken)) {
    //             throw new Error('Invalid verify token.');
    //           }

    //           console.info(
    //             chalk.blue(
    //               `User ${currentUsername} passed the encryption verification. (UUID: ${currentUUID!.value})`,
    //             ),
    //           );

    //           const sharedSecret = EncryptionAuthenticationService.decryptData(
    //             packet.sharedSecret,
    //             privateKeyPem,
    //           );

    //           console.info(chalk.blue('Enabling cryptography.'));

    //           const cipher = crypto.createCipheriv(
    //             'aes-128-cfb8',
    //             sharedSecret,
    //             sharedSecret.subarray(0, 16),
    //           );
    //           const decipher = crypto.createDecipheriv(
    //             'aes-128-cfb8',
    //             sharedSecret,
    //             sharedSecret.subarray(0, 16),
    //           );
    //         } catch (error: unknown) {
    //           socket.end();

    //           throw new Error(`Invalid token encrypted.`);
    //         }

    //         break;
    //       }
    //       default:
    //         console.log('Unknown packet from Login.');
    //     }

    //     break;
    //   }
    //   default:
    //     throw new Error(`Invalid current state: ${currentState}`);
    // }
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
