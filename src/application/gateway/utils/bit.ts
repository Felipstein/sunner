import { PlayerAbilities } from '@domain/value-objects/player-abilities';
import { Position } from '@domain/value-objects/position';
import { UUID } from '@domain/value-objects/uuid';

function readVarInt(buffer: Buffer, offset = 0) {
  let numRead = 0;
  let result = 0;
  let byte: number;

  do {
    byte = buffer.readUInt8(offset++);
    result |= (byte & 0x7f) << (7 * numRead++);
    if (numRead > 5) {
      throw new Error('VarInt is too big');
    }
  } while (byte >= 0x80);

  return { value: result, offset };
}

function readInt(buffer: Buffer, offset = 0) {
  const value = buffer.readInt32BE(offset);

  return { value, offset: offset + 4 };
}

function readShort(buffer: Buffer, offset = 0) {
  const value = buffer.readInt16BE(offset);

  return { value, offset: offset + 2 };
}

function readLong(buffer: Buffer, offset = 0) {
  const value = buffer.readBigInt64BE(offset);

  return { value, offset: offset + 8 };
}

function readUnsignedLong(buffer: Buffer, offset = 0) {
  const value = buffer.readBigUInt64BE(offset);

  return { value, offset: offset + 8 };
}

function readFloat(buffer: Buffer, offset = 0) {
  const value = buffer.readFloatBE(offset);

  return { value, offset: offset + 4 };
}

function readDouble(buffer: Buffer, offset = 0) {
  const value = buffer.readDoubleBE(offset);

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

function readByte(buffer: Buffer, offset = 0) {
  const value = buffer.readInt8(offset);

  return { value, offset: offset + 1 };
}

function readUnsignedByte(buffer: Buffer, offset = 0) {
  const value = buffer.readUInt8(offset);

  return { value, offset: offset + 1 };
}

function readBytes(buffer: Buffer, length: number, offset = 0) {
  const value = buffer.subarray(offset, offset + length);

  return { value, offset: offset + length };
}

function readBoolean(buffer: Buffer, offset = 0) {
  const value = buffer.readInt8(offset) !== 0;

  return { value, offset: offset + 1 };
}

function readPosition(buffer: Buffer, offset = 0) {
  const positionValue = buffer.readBigInt64BE(offset);

  let x = Number((positionValue >> 38n) & 0x3ffffffn);
  let z = Number((positionValue >> 12n) & 0x3ffffffn);
  let y = Number(positionValue & 0xfffn);

  // Ajusta para números negativos em complemento de dois
  if (x >= 0x2000000) {
    x -= 0x4000000;
  }
  if (z >= 0x2000000) {
    z -= 0x4000000;
  }
  if (y >= 0x800) {
    y -= 0x1000;
  }

  return { value: new Position(x, y, z), offset: offset + 8 };
}

function readPlayerAbilities(buffer: Buffer, offset = 0) {
  const flags = buffer.readUint8(offset);

  const invulnerable = (flags & 0x01) === 0x01;
  const flying = (flags & 0x02) === 0x02;
  const allowFlying = (flags & 0x04) === 0x04;
  const creativeMode = (flags & 0x08) === 0x08;

  return {
    value: new PlayerAbilities({ invulnerable, flying, allowFlying, creativeMode }),
    offset: offset + 1,
  };
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

function writeInt(value: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeInt32BE(value, 0);

  return buffer;
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

function writeUnsignedLong(value: bigint) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(value, 0);

  return buffer;
}

function writeByte(value: number) {
  const buffer = Buffer.alloc(1);
  buffer.writeInt8(value, 0);
  return buffer;
}

function writeUnsignedByte(value: number) {
  const buffer = Buffer.alloc(1);
  buffer.writeUInt8(value, 0);
  return buffer;
}

function writeFloat(value: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeFloatBE(value, 0);
  return buffer;
}

function writeDouble(value: number) {
  const buffer = Buffer.alloc(8);
  buffer.writeDoubleBE(value, 0);
  return buffer;
}

function writeString(value: string, encoding: BufferEncoding = 'utf-8') {
  const buffer = Buffer.from(value, encoding);
  const length = writeVarInt(buffer.length);

  return Buffer.concat([length, buffer]);
}

function writeUUID(value: UUID) {
  const cleanedUUID = value.toString().replace(/-/g, '');
  const buffer = Buffer.from(cleanedUUID, 'hex');
  return buffer;
}

function writeBoolean(value: boolean) {
  const buffer = Buffer.alloc(1);
  buffer.writeInt8(value ? 1 : 0, 0);
  return buffer;
}

function writePosition(position: Position) {
  const x = position.x & 0x3ffffff;
  const z = position.z & 0x3ffffff;
  const y = position.y & 0xfff;

  const positionValue =
    ((BigInt(x) & 0x3ffffffn) << 38n) | ((BigInt(z) & 0x3ffffffn) << 12n) | (BigInt(y) & 0xfffn);

  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(positionValue, 0);
  return buffer;
}

function writePlayerAbilities(playerAbilities: PlayerAbilities) {
  let flags = 0;

  if (playerAbilities.invulnerable) flags |= 0x01;
  if (playerAbilities.flying) flags |= 0x02;
  if (playerAbilities.allowFlying) flags |= 0x04;
  if (playerAbilities.creativeMode) flags |= 0x08;

  return writeByte(flags);
}

export const bitUtils = {
  readVarInt,
  readInt,
  readShort,
  readLong,
  readUnsignedLong,
  readFloat,
  readDouble,
  readString,
  readUUID,
  readByte,
  readUnsignedByte,
  readBytes,
  readBoolean,
  readPosition,
  readPlayerAbilities,
  writeVarInt,
  writeInt,
  writeShort,
  writeLong,
  writeUnsignedLong,
  writeByte,
  writeUnsignedByte,
  writeFloat,
  writeDouble,
  writeString,
  writeUUID,
  writeBoolean,
  writePosition,
  writePlayerAbilities,
};
