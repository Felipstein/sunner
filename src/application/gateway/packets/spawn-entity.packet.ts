import { UUID } from '@domain/value-objects/uuid';
import { Packet } from '@gateway/core/packet';
import { UnknownPacket } from '@gateway/core/unknown-packet';
import { bitUtils } from '@gateway/utils/bit';

interface SpawnEntityBuilder {
  entityId: number;
  entityUUID: UUID;
  type: number;
  x: number;
  y: number;
  z: number;
  pitch: number;
  yaw: number;
  headYaw: number;
  data: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
}

export class SpawnEntityPacket extends Packet {
  static readonly PACKET_ID = 0x01;

  readonly entityId: number;
  readonly entityUUID: UUID;
  readonly type: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly pitch: number;
  readonly yaw: number;
  readonly headYaw: number;
  readonly data: number;
  readonly velocityX: number;
  readonly velocityY: number;
  readonly velocityZ: number;

  constructor(builder: SpawnEntityBuilder) {
    super(SpawnEntityPacket.PACKET_ID);

    this.entityId = builder.entityId;
    this.entityUUID = builder.entityUUID;
    this.type = builder.type;
    this.x = builder.x;
    this.y = builder.y;
    this.z = builder.z;
    this.pitch = builder.pitch;
    this.yaw = builder.yaw;
    this.headYaw = builder.headYaw;
    this.data = builder.data;
    this.velocityX = builder.velocityX;
    this.velocityY = builder.velocityY;
    this.velocityZ = builder.velocityZ;
  }

  protected override dataToBuffer() {
    const bufferedEntityId = bitUtils.writeVarInt(this.entityId);
    const bufferedEntityUUID = bitUtils.writeUUID(this.entityUUID);
    const bufferedType = bitUtils.writeVarInt(this.type);
    const bufferedX = bitUtils.writeVarInt(this.x);
    const bufferedY = bitUtils.writeVarInt(this.y);
    const bufferedZ = bitUtils.writeVarInt(this.z);
    const bufferedPitch = bitUtils.writeVarInt(this.pitch);
    const bufferedYaw = bitUtils.writeVarInt(this.yaw);
    const bufferedHeadYaw = bitUtils.writeVarInt(this.headYaw);
    const bufferedData = bitUtils.writeVarInt(this.data);
    const bufferedVelocityX = bitUtils.writeShort(this.velocityX);
    const bufferedVelocityY = bitUtils.writeShort(this.velocityY);
    const bufferedVelocityZ = bitUtils.writeShort(this.velocityZ);

    return [
      bufferedEntityId,
      bufferedEntityUUID,
      bufferedType,
      bufferedX,
      bufferedY,
      bufferedZ,
      bufferedPitch,
      bufferedYaw,
      bufferedHeadYaw,
      bufferedData,
      bufferedVelocityX,
      bufferedVelocityY,
      bufferedVelocityZ,
    ];
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const entityId = bufferIterator.readVarInt();
    const entityUUID = bufferIterator.readUUID();
    const type = bufferIterator.readVarInt();
    const x = bufferIterator.readVarInt();
    const y = bufferIterator.readVarInt();
    const z = bufferIterator.readVarInt();
    const pitch = bufferIterator.readVarInt();
    const yaw = bufferIterator.readVarInt();
    const headYaw = bufferIterator.readVarInt();
    const data = bufferIterator.readVarInt();
    const velocityX = bufferIterator.readByte();
    const velocityY = bufferIterator.readByte();
    const velocityZ = bufferIterator.readByte();

    const packet = new SpawnEntityPacket({
      entityId,
      entityUUID,
      type,
      x,
      y,
      z,
      pitch,
      yaw,
      headYaw,
      data,
      velocityX,
      velocityY,
      velocityZ,
    });
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(unknownPacket: UnknownPacket) {
    return this.fromBuffer(unknownPacket.toBuffer());
  }
}
