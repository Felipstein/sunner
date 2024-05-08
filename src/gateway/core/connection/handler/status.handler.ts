import { Connection } from '..';
import { ConnectionState } from '../../../@types/connection-state';
import { PingRequestPacket } from '../../../packets/ping-request.packet';
import { PingResponsePacket } from '../../../packets/ping-response.packet';
import { UnknownPacket } from '../../../packets/unknown-packet';

import { ConnectionHandler } from '.';

export class StatusConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.STATUS, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket) {
    switch (unknownPacket.id) {
      case 0x01: {
        const pingRequestPacket = PingRequestPacket.fromUnknownPacket(unknownPacket);
        const pingResponsePacket = new PingResponsePacket(pingRequestPacket.payload);

        this.reply(pingResponsePacket);
        break;
      }
      default: {
        console.log(`Unknown packet from ${this.constructor.name} ${unknownPacket.hexId()}`);
      }
    }
  }
}
