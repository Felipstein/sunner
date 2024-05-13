import { ConnectionState } from '@gateway/@types/connection-state';
import { Packet } from '@gateway/core/packet';
import { UnknownPacket } from '@gateway/core/unknown-packet';

import { Connection } from '..';

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
