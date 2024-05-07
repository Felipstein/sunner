import { UUID } from '../../shared/value-objects/uuid';

function readVarInt(buffer: Buffer, offset = 0) {
  let numRead = 0;
  let result = 0;
  let byte: number;

  do {
    byte = buffer.readUint8(offset++);
    result |= (byte & 0x7f) << (7 * numRead++);
    if (numRead > 5) {
      throw new Error('VarInt is too big');
    }
  } while (byte >= 0x80);

  return { value: result, offset };
}

function readShort(buffer: Buffer, offset = 0) {
  const value = buffer.readInt16BE(offset);

  return { value, offset: offset + 2 };
}

function readLong(buffer: Buffer, offset = 0) {
  const value = buffer.readBigInt64BE(offset);

  return { value, offset: offset + 8 };
}

function readString(buffer: Buffer, offset = 0, encoding: BufferEncoding = 'utf-8') {
  const lengthInfo = readVarInt(buffer, offset);
  const stringLength = lengthInfo.value;

  offset = lengthInfo.offset;

  const stringValue = buffer.toString(encoding, offset, offset + stringLength);
  return { value: stringValue, offset: offset + stringLength };
}

function readUUID(buffer: Buffer, offset = 0) {
  const uuidBytes = buffer.subarray(offset, offset + 16);
  const hex = uuidBytes.toString('hex');
  const uuid = `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;

  return { value: new UUID(uuid), offset: offset + 16 };
}

function readBytes(buffer: Buffer, length: number, offset = 0) {
  const value = buffer.subarray(offset, offset + length);

  return { value, offset: offset + length };
}

function writeVarInt(value: number) {
  const bytes: number[] = [];

  do {
    let temp = value & 0b01111111;
    value >>>= 7;

    if (value !== 0) {
      temp |= 0b10000000;
    }

    bytes.push(temp);
  } while (value !== 0);

  return Buffer.from(bytes);
}

function writeShort(value: number) {
  const buffer = Buffer.alloc(2);
  buffer.writeInt16BE(value, 0);

  return buffer;
}

function writeLong(value: bigint) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(value, 0);

  return buffer;
}

function writeString(value: string, encoding: BufferEncoding = 'utf-8') {
  const buffer = Buffer.from(value, encoding);
  const length = writeVarInt(buffer.length);

  return Buffer.concat([length, buffer]);
}

function writeUUID(value: UUID) {
  const cleanedUUID = value.value.replace(/-/g, '');
  const buffer = Buffer.from(cleanedUUID, 'hex');
  return buffer;
}

export const bitUtils = {
  readVarInt,
  readShort,
  readLong,
  readString,
  readUUID,
  readBytes,
  writeVarInt,
  writeShort,
  writeLong,
  writeString,
  writeUUID,
};
