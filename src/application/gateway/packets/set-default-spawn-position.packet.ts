import { Position } from '@domain/value-objects/position';
import { Packet } from '@gateway/core/packet';
import { UnknownPacket } from '@gateway/core/unknown-packet';
import { bitUtils } from '@gateway/utils/bit';

export class SetDefaultSpawnPositionPacket extends Packet {
  static readonly PACKET_ID = 0x54;

  constructor(
    readonly location: Position,
    readonly angle: number,
  ) {
    super(SetDefaultSpawnPositionPacket.PACKET_ID);
  }

  protected override dataToBuffer() {
    const bufferedLocation = bitUtils.writePosition(this.location);
    const bufferedAngle = bitUtils.writeFloat(this.angle);

    return [bufferedLocation, bufferedAngle];
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const location = bufferIterator.readPosition();
    const angle = bufferIterator.readFloat();

    const packet = new SetDefaultSpawnPositionPacket(location, angle);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(unknownPacket: UnknownPacket) {
    return this.fromBuffer(unknownPacket.toBuffer());
  }
}
