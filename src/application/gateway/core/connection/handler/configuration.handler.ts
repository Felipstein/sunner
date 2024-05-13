import fs from 'node:fs';

import chalk from 'chalk';

import { worldDir } from '@application/shared/worldDir';
import { GameMode } from '@domain/game-mode';
import { Identifier } from '@domain/value-objects/identifier';
import { Position } from '@domain/value-objects/position';
import { ConnectionState } from '@gateway/@types/connection-state';
import { CoreServer } from '@gateway/core/core-server';
import { UnknownPacket } from '@gateway/core/unknown-packet';
import { ClientInformationPacket } from '@gateway/packets/client-information.packet';
import { FinishConfigurationPacket } from '@gateway/packets/finish-configuration.packet';
import { LoginPacket } from '@gateway/packets/login.packet';
import { SetDefaultSpawnPositionPacket } from '@gateway/packets/set-default-spawn-position.packet';
import { getFirst8BytesOfSeed } from '@gateway/utils/get-first-8-bytes-of-seed';
import { getSeed } from '@gateway/utils/get-seed';
import { Logger } from '@infra/logger';

import { Connection } from '..';

import { ConnectionHandler } from '.';

const log = Logger.init('CONFIGURATION_CONNECTION_HANDLER');

export class ConfigurationConnectionHandler extends ConnectionHandler {
  constructor(connection: Connection) {
    super(ConnectionState.CONFIGURATION, connection);
  }

  override onArrivalPacket(unknownPacket: UnknownPacket) {
    switch (unknownPacket.id) {
      case 0x00: {
        const clientInformationPacket = ClientInformationPacket.fromUnknownPacket(unknownPacket);

        log.debug(
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

        log.debug(
          chalk.blue(
            `User ${this.connection.encryptionStage!.username} acknowledged configuration state, starting play state.`,
          ),
        );

        this.connection.changeState(ConnectionState.PLAY);

        this.onStartPlay();
        break;
      }
      default: {
        log.warn(`Unknown packet from ${this.constructor.name} ${unknownPacket.hexId()}`);
      }
    }
  }

  async onStartPlay() {
    const levelDatContent = fs.readFileSync(`${worldDir}/level.dat`);
    const hashedSeed = getFirst8BytesOfSeed(await getSeed(levelDatContent));

    const entityID = CoreServer.singleton.generateEntityId();

    const loginPacket = new LoginPacket({
      entityID,
      isHardcore: false,
      dimensionNames: [new Identifier('overworld')],
      maxPlayers: 0,
      viewDistance: 8,
      simulationDistance: 8,
      reducedDebugInfo: false,
      enableRespawnScreen: true,
      doLimitedCrafting: false,
      dimensionType: new Identifier('overworld'),
      dimensionName: new Identifier('world'),
      hashedSeed,
      gameMode: GameMode.SURVIVAL,
      previousGameMode: -1,
      isDebug: false,
      isFlat: false,
      hasDeathLocation: false,
      portalCooldown: 0,
    });
    this.reply(loginPacket);

    const spawnPositionPacket = new SetDefaultSpawnPositionPacket(new Position(0, 0, 0), 0);
    this.reply(spawnPositionPacket);

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
  }
}
