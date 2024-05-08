import { Connection } from '..';
import { ConnectionState } from '../../../@types/connection-state';
import { UnknownPacket } from '../../../packets/unknown-packet';

import { ConnectionHandler } from '.';

export class ConfigurationConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.CONFIGURATION, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket) {
    switch (unknownPacket.id) {
      case 0x00: {
        // Client Information Packet
        break;
      }
      case 0x01: {
        // Serverbound Plugin Message Packet
        break;
      }
      default: {
        console.log(`Unknown packet from ${this.constructor.name} ${unknownPacket.hexId()}`);
      }
    }
  }
}
