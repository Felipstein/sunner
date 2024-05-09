import { bitUtils } from '../utils/bit';
import { toHexString } from '../utils/to-hex-string';

import { BufferIterator } from './buffer-iterator';

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
    const bufferedData = this.onlyDataToBuffer();
    const bufferedPacketId = bitUtils.writeVarInt(this.id);

    return bufferedData.length + bufferedPacketId.length;
  }

  get lastOffset() {
    return this._lastOffset;
  }

  protected abstract onlyDataToBuffer(): Buffer;

  toBuffer() {
    const bufferedData = this.onlyDataToBuffer();
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
