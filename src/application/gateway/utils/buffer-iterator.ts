import { bitUtils } from './bit';

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

  readInt() {
    const { value, offset } = bitUtils.readInt(this._buffer, this.currentOffset);

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

  readUnsignedLong() {
    const { value, offset } = bitUtils.readUnsignedLong(this._buffer, this.currentOffset);

    this._prevOffset = this.currentOffset;
    this.currentOffset = offset;
    return value;
  }

  readFloat() {
    const { value, offset } = bitUtils.readFloat(this._buffer, this.currentOffset);

    this._prevOffset = this.currentOffset;
    this.currentOffset = offset;
    return value;
  }

  readDouble() {
    const { value, offset } = bitUtils.readDouble(this._buffer, this.currentOffset);

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

  readByte() {
    const { value, offset } = bitUtils.readByte(this._buffer, this.currentOffset);

    this._prevOffset = this.currentOffset;
    this.currentOffset = offset;
    return value;
  }

  readUnsignedByte() {
    const { value, offset } = bitUtils.readUnsignedByte(this._buffer, this.currentOffset);

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

  readBoolean() {
    const { value, offset } = bitUtils.readBoolean(this._buffer, this.currentOffset);

    this._prevOffset = this.currentOffset;
    this.currentOffset = offset;
    return value;
  }

  readPosition() {
    const { value, offset } = bitUtils.readPosition(this._buffer, this.currentOffset);

    this._prevOffset = this.currentOffset;
    this.currentOffset = offset;
    return value;
  }

  readPlayerAbilities() {
    const { value, offset } = bitUtils.readPlayerAbilities(this._buffer, this.currentOffset);

    this._prevOffset = this.currentOffset;
    this.currentOffset = offset;
    return value;
  }
}
