import { bitUtils } from '../utils/bit';

export class BufferIterator {
  private _prevOffset = 0;
  private currentOffset = 0;

  constructor(private _buffer: Buffer) {}

  get prevOffset() {
    return this._prevOffset;
  }

  get lastOffset() {
    return this.currentOffset;
  }

  get buffer() {
    return this._buffer;
  }

  readVarInt() {
    const { value, offset } = bitUtils.readVarInt(this._buffer, this.currentOffset);

    this._prevOffset = this.currentOffset;
    this.currentOffset = offset;
    return value;
  }

  readShort() {
    const { value, offset } = bitUtils.readShort(this._buffer, this.currentOffset);

    this._prevOffset = this.currentOffset;
    this.currentOffset = offset;
    return value;
  }

  readLong() {
    const { value, offset } = bitUtils.readLong(this._buffer, this.currentOffset);

    this._prevOffset = this.currentOffset;
    this.currentOffset = offset;
    return value;
  }

  readString() {
    const { value, offset } = bitUtils.readString(this._buffer, this.currentOffset);

    this._prevOffset = this.currentOffset;
    this.currentOffset = offset;
    return value;
  }

  readUUID() {
    const { value, offset } = bitUtils.readUUID(this._buffer, this.currentOffset);

    this._prevOffset = this.currentOffset;
    this.currentOffset = offset;
    return value;
  }

  readBytes(length: number) {
    const { value, offset } = bitUtils.readBytes(this._buffer, length, this.currentOffset);

    this._prevOffset = this.currentOffset;
    this.currentOffset = offset;
    return value;
  }

  readJSON<T extends object = object>() {
    const { value: valueInJSON, offset } = bitUtils.readString(this._buffer, this.currentOffset);

    this._prevOffset = this.currentOffset;
    this.currentOffset = offset;
    return JSON.parse(valueInJSON) as T;
  }
}
