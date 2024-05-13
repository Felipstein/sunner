import { Packet } from '@gateway/core/packet';
import { UnknownPacket } from '@gateway/core/unknown-packet';
import { bitUtils } from '@gateway/utils/bit';

export class PingResponsePacket extends Packet {
  static readonly PACKET_ID = 0x01;

  constructor(readonly payload: bigint) {
    super(PingResponsePacket.PACKET_ID);
  }

  protected override dataToBuffer(): Buffer {
    return bitUtils.writeLong(this.payload);
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const payload = bufferIterator.readLong();

    const packet = new PingResponsePacket(payload);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
