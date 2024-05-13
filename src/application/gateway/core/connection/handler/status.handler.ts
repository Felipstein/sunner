import { Connection } from '..';
import { Logger } from '../../../../infra/logger';
import { ConnectionState } from '../../../@types/connection-state';
import { PingRequestPacket } from '../../../packets/ping-request.packet';
import { PingResponsePacket } from '../../../packets/ping-response.packet';
import { StatusResponsePacket } from '../../../packets/status-response.packet';
import { getMCVersionByProtocol, ProtocolVersion } from '../../../protocol-version';
import { UnknownPacket } from '../../unknown-packet';

import { ConnectionHandler } from '.';

const log = Logger.init('STATUS_CONNECTION_HANDLER');

export class StatusConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.STATUS, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket) {
    switch (unknownPacket.id) {
      case 0x00: {
        this.onReturnServerStatus();
        break;
      }
      case 0x01: {
        const pingRequestPacket = PingRequestPacket.fromUnknownPacket(unknownPacket);
        const pingResponsePacket = new PingResponsePacket(pingRequestPacket.payload);

        this.reply(pingResponsePacket);
        break;
      }
      default: {
        log.warn(`Unknown packet from ${this.constructor.name} ${unknownPacket.hexId()}`);
      }
    }
  }

  private onReturnServerStatus() {
    const protocolVersion = ProtocolVersion.V1_20_4;
    const statusResponsePacket = new StatusResponsePacket({
      version: { name: getMCVersionByProtocol(protocolVersion), protocol: protocolVersion },
      players: { max: 100, online: 0 },
      description: { text: 'Welcome my friend!', color: 'red' },
    });

    this.reply(statusResponsePacket);
  }
}
