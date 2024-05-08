import { Connection } from '..';
import { ConnectionState } from '../../../@types/connection-state';
import { UnknownPacket } from '../../../packets/unknown-packet';

import { ConnectionHandler } from '.';

export class ConfigurationConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.CONFIGURATION, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket) {
    console.log('configuration:', unknownPacket.hexId());
  }
}
