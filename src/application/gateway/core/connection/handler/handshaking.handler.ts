import { ConnectionState } from '@gateway/@types/connection-state';
import { UnknownPacket } from '@gateway/core/unknown-packet';
import { HandshakePacket } from '@gateway/packets/handshake.packet';
import { Logger } from '@infra/logger';

import { Connection } from '..';

import { ConnectionHandler } from '.';

const log = Logger.init('HANDSHAKING_CONNECTION_HANDLER');

export class HandshakingConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.HANDSHAKING, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket) {
    switch (unknownPacket.id) {
      case 0x00: {
        const handshakePacket = HandshakePacket.fromUnknownPacket(unknownPacket);

        if (handshakePacket.nextState === 1) {
          this.connection.changeState(ConnectionState.STATUS);
          break;
        }

        if (handshakePacket.nextState === 2) {
          this.connection.changeState(ConnectionState.LOGIN);
          break;
        }

        throw new Error(`Invalid next state: ${handshakePacket.nextState}`);
      }
      default: {
        log.warn(`Unknown packet from ${this.constructor.name} ${unknownPacket.hexId()}`);
      }
    }
  }
}
