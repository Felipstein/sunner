import { Connection } from '..';
import { ConnectionState } from '../../../@types/connection-state';
import { UnknownPacket } from '../../unknown-packet';

import { ConnectionHandler } from '.';

export class PlayConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.PLAY, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket) {
    console.log('play:', unknownPacket.hexId());
  }
}
