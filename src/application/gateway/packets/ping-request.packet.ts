import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';
import { bitUtils } from '../utils/bit';

export class PingRequestPacket extends Packet {
  static readonly PACKET_ID = 0x01;

  constructor(readonly payload: bigint) {
    super(PingRequestPacket.PACKET_ID);
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

    const packet = new PingRequestPacket(payload);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
