import { GameMode } from '../../shared/game-mode';
import { Identifier } from '../../shared/value-objects/identifier';
import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';
import { bitUtils } from '../utils/bit';

type LoginBuilderBase = {
  entityID: number;
  isHardcore: boolean;
  dimensionNames: Identifier[];
  maxPlayers: number;
  viewDistance: number;
  simulationDistance: number;
  reducedDebugInfo: boolean;
  enableRespawnScreen: boolean;
  doLimitedCrafting: boolean;
  dimensionType: Identifier;
  dimensionName: Identifier;
  hashedSeed: bigint;
  gameMode: GameMode;
  previousGameMode: GameMode | -1;
  isDebug: boolean;
  isFlat: boolean;
  portalCooldown: number;
};

type LoginBuilderDeathLocation =
  | {
      hasDeathLocation: boolean;
      deathDimensionName?: Identifier | null;
      deathLocation?: number | null;
    }
  | {
      hasDeathLocation: true;
      deathDimensionName: Identifier;
      deathLocation: number;
    }
  | {
      hasDeathLocation: false;
      deathDimensionName?: null;
      deathLocation?: null;
    };

type LoginBuilder = LoginBuilderBase & LoginBuilderDeathLocation;

export class LoginPacket extends Packet {
  static readonly PACKET_ID = 0x29;

  readonly entityID: number;
  readonly isHardcore: boolean;
  readonly dimensionNames: Identifier[];
  readonly maxPlayers: number;
  readonly viewDistance: number;
  readonly simulationDistance: number;
  readonly reducedDebugInfo: boolean;
  readonly enableRespawnScreen: boolean;
  readonly doLimitedCrafting: boolean;
  readonly dimensionType: Identifier;
  readonly dimensionName: Identifier;
  readonly hashedSeed: bigint;
  readonly gameMode: GameMode;
  readonly previousGameMode: GameMode | -1;
  readonly isDebug: boolean;
  readonly isFlat: boolean;
  readonly hasDeathLocation: boolean;
  readonly deathDimensionName: Identifier | null;
  readonly deathLocation: number | null;
  readonly portalCooldown: number;

  constructor(builder: LoginBuilder) {
    super(LoginPacket.PACKET_ID);

    this.entityID = builder.entityID;
    this.isHardcore = builder.isHardcore;
    this.dimensionNames = builder.dimensionNames;
    this.maxPlayers = builder.maxPlayers;
    this.viewDistance = builder.viewDistance;
    this.simulationDistance = builder.simulationDistance;
    this.reducedDebugInfo = builder.reducedDebugInfo;
    this.enableRespawnScreen = builder.enableRespawnScreen;
    this.doLimitedCrafting = builder.doLimitedCrafting;
    this.dimensionType = builder.dimensionType;
    this.dimensionName = builder.dimensionName;
    this.hashedSeed = builder.hashedSeed;
    this.gameMode = builder.gameMode;
    this.previousGameMode = builder.previousGameMode;
    this.isDebug = builder.isDebug;
    this.isFlat = builder.isFlat;
    this.hasDeathLocation = builder.hasDeathLocation;
    this.deathDimensionName = builder.deathDimensionName ?? null;
    this.deathLocation = builder.deathLocation ?? null;
    this.portalCooldown = builder.portalCooldown;
  }

  protected override dataToBuffer() {
    const bufferedEntityID = bitUtils.writeInt(this.entityID);
    const bufferedIsHardcore = bitUtils.writeBoolean(this.isHardcore);
    const bufferedDimensionCount = bitUtils.writeVarInt(this.dimensionNames.length);
    const bufferedDimensionNames = this.dimensionNames.map((dimensionName) =>
      bitUtils.writeString(dimensionName.toString()),
    );
    const bufferedMaxPlayers = bitUtils.writeVarInt(this.maxPlayers);
    const bufferedViewDistance = bitUtils.writeVarInt(this.viewDistance);
    const bufferedSimulationDistance = bitUtils.writeVarInt(this.simulationDistance);
    const bufferedReducedDebugInfo = bitUtils.writeBoolean(this.reducedDebugInfo);
    const bufferedEnableRespawnScreen = bitUtils.writeBoolean(this.enableRespawnScreen);
    const bufferedDoLimitedCrafting = bitUtils.writeBoolean(this.doLimitedCrafting);
    const bufferedDimensionType = bitUtils.writeString(this.dimensionType.toString());
    const bufferedDimensionName = bitUtils.writeString(this.dimensionName.toString());
    const bufferedHashedSeed = bitUtils.writeLong(this.hashedSeed);
    const bufferedGameMode = bitUtils.writeUnsignedByte(this.gameMode);
    const bufferedPreviousGameMode = bitUtils.writeByte(this.previousGameMode);
    const bufferedIsDebug = bitUtils.writeBoolean(this.isDebug);
    const bufferedIsFlat = bitUtils.writeBoolean(this.isFlat);
    const bufferedHasDeathLocation = bitUtils.writeBoolean(this.hasDeathLocation);
    const bufferedDeathDimensionName =
      this.deathDimensionName !== null
        ? bitUtils.writeString(this.deathDimensionName.toString())
        : Buffer.alloc(0);
    const bufferedDeathLocation =
      this.deathLocation !== null ? bitUtils.writeVarInt(this.deathLocation) : Buffer.alloc(0);
    const bufferedPortalCooldown = bitUtils.writeVarInt(this.portalCooldown);

    return [
      bufferedEntityID,
      bufferedIsHardcore,
      bufferedDimensionCount,
      ...bufferedDimensionNames,
      bufferedMaxPlayers,
      bufferedViewDistance,
      bufferedSimulationDistance,
      bufferedReducedDebugInfo,
      bufferedEnableRespawnScreen,
      bufferedDoLimitedCrafting,
      bufferedDimensionType,
      bufferedDimensionName,
      bufferedHashedSeed,
      bufferedGameMode,
      bufferedPreviousGameMode,
      bufferedIsDebug,
      bufferedIsFlat,
      bufferedHasDeathLocation,
      bufferedDeathDimensionName,
      bufferedDeathLocation,
      bufferedPortalCooldown,
    ];
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const entityID = bufferIterator.readInt();
    const isHardcore = bufferIterator.readBoolean();
    const dimensionCount = bufferIterator.readVarInt();
    const dimensionNames: Identifier[] = [];

    for (let i = 0; i < dimensionCount; i++) {
      dimensionNames.push(new Identifier(bufferIterator.readString()));
    }

    const maxPlayers = bufferIterator.readVarInt();
    const viewDistance = bufferIterator.readVarInt();
    const simulationDistance = bufferIterator.readVarInt();
    const reducedDebugInfo = bufferIterator.readBoolean();
    const enableRespawnScreen = bufferIterator.readBoolean();
    const doLimitedCrafting = bufferIterator.readBoolean();
    const dimensionType = new Identifier(bufferIterator.readString());
    const dimensionName = new Identifier(bufferIterator.readString());
    const hashedSeed = bufferIterator.readUnsignedLong();
    const gameMode = bufferIterator.readUnsignedByte();
    const previousGameMode = bufferIterator.readByte();
    const isDebug = bufferIterator.readBoolean();
    const isFlat = bufferIterator.readBoolean();
    const hasDeathLocation = bufferIterator.readBoolean();
    const deathDimensionName = hasDeathLocation
      ? new Identifier(bufferIterator.readString())
      : null;
    const deathLocation = hasDeathLocation ? bufferIterator.readVarInt() : null;
    const portalCooldown = bufferIterator.readVarInt();

    const packet = new LoginPacket({
      entityID,
      isHardcore,
      dimensionNames,
      maxPlayers,
      viewDistance,
      simulationDistance,
      reducedDebugInfo,
      enableRespawnScreen,
      doLimitedCrafting,
      dimensionType,
      dimensionName,
      hashedSeed,
      gameMode,
      previousGameMode,
      isDebug,
      isFlat,
      hasDeathLocation,
      deathDimensionName,
      deathLocation,
      portalCooldown,
    });
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(unknownPacket: UnknownPacket) {
    return this.fromBuffer(unknownPacket.toBuffer());
  }
}
