import { Packet } from '@gateway/core/packet';
import { UnknownPacket } from '@gateway/core/unknown-packet';

export class AcknowledgeFinishConfigurationPacket extends Packet {
  static readonly PACKET_ID = 0x02;

  constructor() {
    super(AcknowledgeFinishConfigurationPacket.PACKET_ID);
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

    const packet = new AcknowledgeFinishConfigurationPacket();
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
