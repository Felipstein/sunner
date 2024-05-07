import { Packet } from '../core/packet';
import { bitUtils } from '../utils/bit';

import { UnknownPacket } from './unknown-packet';

export class PingResponsePacket extends Packet {
  static readonly PACKET_ID = 0x01;

  constructor(readonly payload: bigint) {
    super(PingResponsePacket.PACKET_ID);
  }

  override get totalLength() {
    const bufferedPayload = bitUtils.writeLong(this.payload);

    return this.calculateLength(bufferedPayload);
  }

  override toBuffer() {
    const bufferedPayload = bitUtils.writeLong(this.payload);

    return this.compact(bufferedPayload);
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
