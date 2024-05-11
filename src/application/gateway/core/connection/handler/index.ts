import { Connection } from '..';
import { ConnectionState } from '../../../@types/connection-state';
import { Packet } from '../../packet';
import { UnknownPacket } from '../../unknown-packet';

export type Reply = (packet: Packet) => void;

export abstract class ConnectionHandler {
  protected readonly reply: Reply;

  constructor(
    readonly stage: ConnectionState,
    readonly connection: Connection,
  ) {
    this.reply = connection.sendPacket.bind(connection);
  }

  abstract onArrivalPacket(unknownPacket: UnknownPacket): Promise<void> | void;
}
