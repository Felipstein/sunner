import { JSONTextComponent } from '../../domain/json-text-component';
import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';
import { bitUtils } from '../utils/bit';

interface StatusResponsePayload {
  version: { name: string; protocol: number };
  players: { max: number; online: number };
  description: JSONTextComponent;
}

export class StatusResponsePacket extends Packet {
  static readonly PACKET_ID = 0x00;

  constructor(readonly payload: StatusResponsePayload) {
    super(StatusResponsePacket.PACKET_ID);
  }

  protected override dataToBuffer() {
    return bitUtils.writeString(JSON.stringify(this.payload));
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const payload = bufferIterator.readJSON<StatusResponsePayload>();

    const packet = new StatusResponsePacket(payload);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
