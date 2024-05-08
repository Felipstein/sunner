import { Connection } from '..';
import { ConnectionState } from '../../../@types/connection-state';
import { UnknownPacket } from '../../../packets/unknown-packet';

import { ConnectionHandler } from '.';

export class StatusConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.STATUS, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket) {
    console.log('status:', unknownPacket.hexId());
  }
}
