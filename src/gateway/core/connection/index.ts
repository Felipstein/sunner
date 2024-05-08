import type { Socket } from 'net';

import chalk from 'chalk';

import { Packet } from '../packet';

import { EncryptionStage } from './encryption-stage';
import { ConnectionHandler } from './handler';
import { HandshakingConnectionHandler } from './handler/handshaking.handler';

export class Connection {
  readonly handler: ConnectionHandler;

  readonly encryptionStage: EncryptionStage | null;

  constructor(private readonly socket: Socket) {
    this.handler = new HandshakingConnectionHandler(this);

    this.encryptionStage = null;
  }

  get state() {
    return this.handler.stage;
  }

  sendPacket(packet: Packet) {
    console.info(
      chalk.gray('->> Sent packet\t\t'),
      `Packet ID: ${chalk.yellow(packet.hexId())}`,
      '-',
      chalk.green(this.state),
      '-',
      chalk.cyan(packet.constructor.name),
      chalk.italic(`- ( ${packet.totalLength} bytes )`),
    );

    this.socket.write(packet.toBuffer());
  }
}
