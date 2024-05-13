import { bitUtils } from '@gateway/utils/bit';
import { BufferIterator } from '@gateway/utils/buffer-iterator';
import { toHexString } from '@gateway/utils/to-hex-string';

export abstract class Packet {
  protected lengthFromHeader = 0;
  protected _lastOffset = 0;

  protected constructor(readonly id: number) {}

  hexId() {
    return toHexString(this.id);
  }

  get length() {
    return this.lengthFromHeader;
  }

  get totalLength() {
    const bufferedData = this.dataToBuffer() ?? Buffer.alloc(0);
    const bufferedPacketId = bitUtils.writeVarInt(this.id);

    return bufferedData.length + bufferedPacketId.length;
  }

  get lastOffset() {
    return this._lastOffset;
  }

  protected abstract dataToBuffer(): Buffer | Buffer[] | null;

  toBuffer() {
    const dataToBuffer = this.dataToBuffer() ?? Buffer.alloc(0);

    const bufferedData = Array.isArray(dataToBuffer) ? Buffer.concat(dataToBuffer) : dataToBuffer;
    const bufferedPacketId = bitUtils.writeVarInt(this.id);
    const bufferedLength = bitUtils.writeVarInt(bufferedData.length + bufferedPacketId.length);

    return Buffer.concat([bufferedLength, bufferedPacketId, bufferedData]);
  }

  protected static abstractPacketHeader(buffer: Buffer) {
    const bufferIterator = new BufferIterator(buffer);

    const packetLength = bufferIterator.readVarInt();
    const offsetAfterPacketLength = bufferIterator.lastOffset;

    const packetId = bufferIterator.readVarInt();
    const offsetAfterPacketId = bufferIterator.lastOffset;

    return { packetLength, packetId, offsetAfterPacketLength, offsetAfterPacketId, bufferIterator };
  }
}
