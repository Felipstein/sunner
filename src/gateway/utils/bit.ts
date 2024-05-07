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

function readString(buffer: Buffer, offset = 0) {
  const lengthInfo = readVarInt(buffer, offset);
  const stringLength = lengthInfo.value;

  offset = lengthInfo.offset;

  const stringValue = buffer.toString('utf-8', offset, offset + stringLength);
  return { value: stringValue, offset: offset + stringLength };
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

function writeString(value: string) {
  const buffer = Buffer.from(value, 'utf-8');
  const length = writeVarInt(buffer.length);

  return Buffer.concat([length, buffer]);
}

export const bitUtils = { readVarInt, readString, writeVarInt, writeString };
