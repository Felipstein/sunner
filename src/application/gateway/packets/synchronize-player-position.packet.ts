import { Packet } from '@gateway/core/packet';
import { UnknownPacket } from '@gateway/core/unknown-packet';
import { bitUtils } from '@gateway/utils/bit';

interface SynchronizePlayerPositionBuilder {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  flags: {
    x: boolean;
    y: boolean;
    z: boolean;
    y_rotation_pitch: boolean;
    x_rotation_yaw: boolean;
  };
  teleportId: number;
}

export class SynchronizePlayerPositionPacket extends Packet {
  static readonly PACKET_ID = 0x3e;

  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly yaw: number;
  readonly pitch: number;
  readonly flags: {
    x: boolean;
    y: boolean;
    z: boolean;
    y_rotation_pitch: boolean;
    x_rotation_yaw: boolean;
  };
  readonly teleportId: number;

  constructor(builder: SynchronizePlayerPositionBuilder) {
    super(SynchronizePlayerPositionPacket.PACKET_ID);

    this.x = builder.x;
    this.y = builder.y;
    this.z = builder.z;
    this.yaw = builder.yaw;
    this.pitch = builder.pitch;
    this.flags = builder.flags;
    this.teleportId = builder.teleportId;
  }

  protected override dataToBuffer() {
    const bufferedX = bitUtils.writeDouble(this.x);
    const bufferedY = bitUtils.writeDouble(this.y);
    const bufferedZ = bitUtils.writeDouble(this.z);
    const bufferedYaw = bitUtils.writeFloat(this.yaw);
    const bufferedPitch = bitUtils.writeFloat(this.pitch);

    let flags = 0;
    if (this.flags.x) flags |= 0x01;
    if (this.flags.y) flags |= 0x02;
    if (this.flags.z) flags |= 0x04;
    if (this.flags.y_rotation_pitch) flags |= 0x08;
    if (this.flags.x_rotation_yaw) flags |= 0x10;
    const bufferedFlags = bitUtils.writeByte(flags);

    const bufferedTeleportId = bitUtils.writeVarInt(this.teleportId);

    return [
      bufferedX,
      bufferedY,
      bufferedZ,
      bufferedYaw,
      bufferedPitch,
      bufferedFlags,
      bufferedTeleportId,
    ];
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const x = bufferIterator.readDouble();
    const y = bufferIterator.readDouble();
    const z = bufferIterator.readDouble();
    const yaw = bufferIterator.readFloat();
    const pitch = bufferIterator.readFloat();

    const flags = bufferIterator.readByte();
    const flagX = (flags & 0x01) === 0x01;
    const flagY = (flags & 0x02) === 0x02;
    const flagZ = (flags & 0x04) === 0x04;
    const flagY_ROT = (flags & 0x08) === 0x08;
    const flagX_ROT = (flags & 0x10) === 0x10;

    const teleportId = bufferIterator.readVarInt();

    const packet = new SynchronizePlayerPositionPacket({
      x,
      y,
      z,
      yaw,
      pitch,
      flags: {
        x: flagX,
        y: flagY,
        z: flagZ,
        y_rotation_pitch: flagY_ROT,
        x_rotation_yaw: flagX_ROT,
      },
      teleportId,
    });
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(unknownPacket: UnknownPacket) {
    return this.fromBuffer(unknownPacket.toBuffer());
  }
}
