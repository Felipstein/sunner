import { Packet } from './packet';

export class UnknownPacket extends Packet {
  constructor(
    id: number,
    readonly data: Buffer,
    readonly compressed: boolean,
    private rawData: Buffer,
  ) {
    super(id);
  }

  slice(fromOffset: number, toOffset?: number) {
    const bufferSliced = this.rawData.subarray(fromOffset, toOffset);

    return UnknownPacket.fromBuffer(bufferSliced);
  }

  protected onlyDataToBuffer() {
    return this.data;
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, offsetAfterPacketLength, offsetAfterPacketId } =
      this.abstractPacketHeader(buffer);

    const totalLength = buffer.subarray(offsetAfterPacketLength).length;

    const packet = new UnknownPacket(
      packetId,
      buffer.subarray(offsetAfterPacketId),
      totalLength > packetLength,
      buffer,
    );
    packet.lengthFromHeader = packetLength;

    return packet;
  }
}
