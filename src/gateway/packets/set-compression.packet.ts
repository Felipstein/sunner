import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';
import { bitUtils } from '../utils/bit';

export class SetCompressionPacket extends Packet {
  static readonly PACKET_ID = 0x03;

  constructor(readonly threshold: number) {
    super(SetCompressionPacket.PACKET_ID);
  }

  protected override onlyDataToBuffer() {
    return bitUtils.writeVarInt(this.threshold);
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const threshold = bufferIterator.readVarInt();

    const packet = new SetCompressionPacket(threshold);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
