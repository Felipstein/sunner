import { Connection } from '..';
import { Logger } from '../../../../infra/logger';
import { ConnectionState } from '../../../@types/connection-state';
import { UnknownPacket } from '../../unknown-packet';

import { ConnectionHandler } from '.';

const log = Logger.init('PLAY_CONNECTION_HANDLER');

export class PlayConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.PLAY, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket) {
    log.debug('play:', unknownPacket.hexId());
  }
}
