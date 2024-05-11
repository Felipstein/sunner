import { JSONTextComponent } from '../../domain/json-text-component';
import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';
import { bitUtils } from '../utils/bit';

export class DisconnectLoginPacket extends Packet {
  static readonly PACKET_ID = 0x00;

  constructor(readonly reason: JSONTextComponent) {
    super(DisconnectLoginPacket.PACKET_ID);
  }

  protected override dataToBuffer() {
    return bitUtils.writeString(JSON.stringify(this.reason));
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const reason = bufferIterator.readJSON<JSONTextComponent>();

    const packet = new DisconnectLoginPacket(reason);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
