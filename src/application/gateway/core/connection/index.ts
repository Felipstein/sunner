import type { Socket } from 'net';

import chalk from 'chalk';

import { Logger } from '../../../infra/logger';
import { ConnectionState } from '../../@types/connection-state';
import { Packet } from '../packet';

import { EncryptionStage } from './encryption-stage';
import { ConnectionHandler } from './handler';
import { ConfigurationConnectionHandler } from './handler/configuration.handler';
import { HandshakingConnectionHandler } from './handler/handshaking.handler';
import { LoginConnectionHandler } from './handler/login.handler';
import { PlayConnectionHandler } from './handler/play.handler';
import { StatusConnectionHandler } from './handler/status.handler';

const log = Logger.init();

export class Connection {
  private _handler: ConnectionHandler;

  encryptionStage: EncryptionStage | null;

  constructor(private readonly socket: Socket) {
    this._handler = new HandshakingConnectionHandler(this);

    this.encryptionStage = null;
  }

  get state() {
    return this._handler.stage;
  }

  get handler() {
    return this._handler;
  }

  isEncryptionEnabled() {
    return !!this.encryptionStage?.isEncryptionEnabled();
  }

  changeState(state: ConnectionState) {
    switch (state) {
      case ConnectionState.HANDSHAKING:
        this._handler = new HandshakingConnectionHandler(this);
        break;
      case ConnectionState.STATUS:
        this._handler = new StatusConnectionHandler(this);
        break;
      case ConnectionState.LOGIN:
        this._handler = new LoginConnectionHandler(this);
        break;
      case ConnectionState.CONFIGURATION:
        this._handler = new ConfigurationConnectionHandler(this);
        break;
      case ConnectionState.PLAY:
        this._handler = new PlayConnectionHandler(this);
        break;
      default:
        throw new Error(`Invalid state: ${state}`);
    }
  }

  onData(handler: (data: Buffer) => void) {
    this.socket.on('data', handler);
  }

  sendPacket(packet: Packet) {
    const encryption = this.encryptionStage?.security;

    log.debugPacket(
      chalk.gray(`->> Sent packet${encryption ? chalk.blue('*') : '\t'}\t`),
      `Packet ID: ${chalk.yellow(packet.hexId())}`,
      '-',
      chalk.green(this.state),
      '-',
      chalk.cyan(packet.constructor.name),
      chalk.italic(`- ( ${packet.totalLength} bytes )`),
    );

    const bufferedPacket = packet.toBuffer();
    const data = encryption ? encryption.cipher.update(bufferedPacket) : bufferedPacket;

    this.socket.write(data);
  }
}
