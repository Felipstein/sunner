import { Connection } from '..';
import { ConnectionState } from '../../../@types/connection-state';
import { UnknownPacket } from '../../../packets/unknown-packet';

import { ConnectionHandler } from '.';

export class LoginConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.LOGIN, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket) {
    console.log('login:', unknownPacket.hexId());
  }
}
