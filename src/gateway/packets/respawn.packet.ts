import { GameMode } from '../../shared/game-mode';
import { Identifier } from '../../shared/value-objects/identifier';
import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';
import { bitUtils } from '../utils/bit';

type RespawnBuilderBase = {
  dimensionType: Identifier;
  dimensionName: Identifier;
  hashedSeed: bigint;
  gameMode: GameMode;
  previousGameMode: GameMode | -1;
  isDebug: boolean;
  isFlat: boolean;
  portalCooldown: number;
  dataKept: number;
};

type RespawnBuilderDeathLocation =
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

type RespawnBuilder = RespawnBuilderBase & RespawnBuilderDeathLocation;

export class RespawnPacket extends Packet {
  static readonly PACKET_ID = 0x45;

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
  readonly dataKept: number;

  constructor(builder: RespawnBuilder) {
    super(RespawnPacket.PACKET_ID);

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
    this.dataKept = builder.dataKept;
  }

  protected override dataToBuffer() {
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
    const bufferedDataKept = bitUtils.writeByte(this.dataKept);

    return [
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
      bufferedDataKept,
    ];
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

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
    const dataKept = bufferIterator.readByte();

    const packet = new RespawnPacket({
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
      dataKept,
    });
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(unknownPacket: UnknownPacket) {
    return this.fromBuffer(unknownPacket.toBuffer());
  }
}
