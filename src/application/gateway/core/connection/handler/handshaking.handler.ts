import { Connection } from '..';
import { Logger } from '../../../../infra/logger';
import { ConnectionState } from '../../../@types/connection-state';
import { HandshakePacket } from '../../../packets/handshake.packet';
import { UnknownPacket } from '../../unknown-packet';

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
