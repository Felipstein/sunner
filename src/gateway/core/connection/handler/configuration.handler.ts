import chalk from 'chalk';

import { Connection } from '..';
import { ConnectionState } from '../../../@types/connection-state';
import { ClientInformationPacket } from '../../../packets/client-information.packet';
import { FinishConfigurationPacket } from '../../../packets/finish-configuration.packet';
import { UnknownPacket } from '../../unknown-packet';

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

        // const seed = fs.readFileSync(`${worldDir}/level.dat`, 'utf-8');

        // const hash = crypto.createHash('sha256');
        // hash.update(seed);
        // const hashBytes = hash.digest();

        // function convertToLong(bytes: Buffer) {
        //   let long = 0;
        //   for (let i = 0; i < bytes.length; i++) {
        //     long = (long << 8) + bytes[i];
        //   }
        //   return long;
        // }

        // console.log('full', convertToLong(hashBytes));
        // console.log('first 8', convertToLong(hashBytes.subarray(0, 8)));
        // console.log('bitUtils', bitUtils.readLong(hashBytes).value);

        // const respawnPacket = new RespawnPacket({
        //   dimensionType: 'minecraft:overworld',
        //   dimensionName: 'world',
        //   hashedSeed: BigInt(0),
        //   gameMode: 0,
        //   previousGameMode: -1,
        //   isDebug: false,
        //   isFlat: false,
        //   hasDeathLocation: false,
        //   deathDimensionName: null,
        //   deathLocation: null,
        //   portalCooldown: 0,
        //   dataKept: 0x01,
        // });
        // this.reply(respawnPacket);
        break;
      }
      default: {
        console.log(`Unknown packet from ${this.constructor.name} ${unknownPacket.hexId()}`);
      }
    }
  }
}
