import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';

export class FinishConfigurationPacket extends Packet {
  static readonly PACKET_ID = 0x02;

  constructor() {
    super(FinishConfigurationPacket.PACKET_ID);
  }

  override get totalLength() {
    return this.calculateLength();
  }

  override toBuffer() {
    return this.compact();
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const packet = new FinishConfigurationPacket();
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
