import { Packet } from '../core/packet';
import { bitUtils } from '../utils/bit';

import { UnknownPacket } from '../core/unknown-packet';

export class ServerboundPluginMessagePacket extends Packet {
  static readonly PACKET_ID = 0x01;

  constructor(
    readonly channel: string,
    readonly data: Buffer,
  ) {
    super(ServerboundPluginMessagePacket.PACKET_ID);
  }

  override get totalLength() {
    const bufferedChannel = bitUtils.writeString(this.channel);

    return this.calculateLength(bufferedChannel, this.data);
  }

  override toBuffer() {
    const bufferedChannel = bitUtils.writeString(this.channel);

    return this.compact(bufferedChannel, this.data);
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const channel = bufferIterator.readString();
    const data = bufferIterator.buffer.subarray(bufferIterator.lastOffset);

    const packet = new ServerboundPluginMessagePacket(channel, data);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
