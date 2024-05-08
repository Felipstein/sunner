import chalk from 'chalk';

import { Connection } from '..';
import { ConnectionState } from '../../../@types/connection-state';
import { ClientInformationPacket } from '../../../packets/client-information.packet';
import { FinishConfigurationPacket } from '../../../packets/finish-configuration.packet';
import { UnknownPacket } from '../../../packets/unknown-packet';

import { ConnectionHandler } from '.';

export class ConfigurationConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.CONFIGURATION, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket) {
    switch (unknownPacket.id) {
      case 0x00: {
        const clientInformationPacket = ClientInformationPacket.fromUnknownPacket(unknownPacket);

        console.log(
          chalk.blue(
            `User ${this.connection.encryptionStage!.username} (${clientInformationPacket.locale}) send client information. Sending Finish Configuration Packet.`,
          ),
        );

        const finishConfigurationPacket = new FinishConfigurationPacket();
        this.reply(finishConfigurationPacket);

        break;
      }
      case 0x01: {
        // Serverbound Plugin Message Packet
        break;
      }
      case 0x02: {
        // Acknowledge Finish Configuration Packet

        console.log(
          chalk.blue(
            `User ${this.connection.encryptionStage!.username} acknowledged configuration state, starting play state.`,
          ),
        );

        this.connection.changeState(ConnectionState.PLAY);
        break;
      }
      default: {
        console.log(`Unknown packet from ${this.constructor.name} ${unknownPacket.hexId()}`);
      }
    }
  }
}
