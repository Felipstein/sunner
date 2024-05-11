import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';

export class StatusRequestPacket extends Packet {
  static readonly PACKET_ID = 0x00;

  constructor() {
    super(StatusRequestPacket.PACKET_ID);
  }

  protected override dataToBuffer() {
    return null;
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const packet = new StatusRequestPacket();
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
