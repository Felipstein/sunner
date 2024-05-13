import { ConnectionState } from '@gateway/@types/connection-state';
import { UnknownPacket } from '@gateway/core/unknown-packet';
import { Logger } from '@infra/logger';

import { Connection } from '..';

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
