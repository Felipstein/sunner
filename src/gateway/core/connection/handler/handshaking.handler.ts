import { Connection } from '..';
import { ConnectionState } from '../../../@types/connection-state';
import { UnknownPacket } from '../../../packets/unknown-packet';

import { ConnectionHandler } from '.';

export class HandshakingConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.HANDSHAKING, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket) {
    console.log('handshaking:', unknownPacket.hexId());
  }
}
