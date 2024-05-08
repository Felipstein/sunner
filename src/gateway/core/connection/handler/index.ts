import { Connection } from '..';
import { ConnectionState } from '../../../@types/connection-state';
import { UnknownPacket } from '../../../packets/unknown-packet';
import { Packet } from '../../packet';

type Reply = (packet: Packet) => void;

export abstract class ConnectionHandler {
  constructor(
    readonly stage: ConnectionState,
    readonly connection: Connection,
  ) {}

  abstract onArrivalPacket(unknownPacket: UnknownPacket, reply: Reply): Promise<void> | void;
}
