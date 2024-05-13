import { UUID } from '@domain/value-objects/uuid';

import { bitUtils } from './bit';

describe('bitUtils', () => {
  it('should write and read VarInt', () => {
    const testValue = 300;
    const writtenBuffer = bitUtils.writeVarInt(testValue);
    const readValue = bitUtils.readVarInt(writtenBuffer);

    expect(readValue.value).toBe(testValue);
    expect(readValue.offset).toBe(writtenBuffer.length);
  });

  it('should write and read Short', () => {
    const testValue = -32768;
    const writtenBuffer = bitUtils.writeShort(testValue);
    const readValue = bitUtils.readShort(writtenBuffer);

    expect(readValue.value).toBe(testValue);
    expect(readValue.offset).toBe(2);
  });

  it('should write and read Long', () => {
    // eslint-disable-next-line no-loss-of-precision
    const testValue = 1234567890123456789n;
    const writtenBuffer = bitUtils.writeLong(testValue);
    const readValue = bitUtils.readLong(writtenBuffer);

    expect(readValue.value).toBe(testValue);
    expect(readValue.offset).toBe(8);
  });

  it('should write and read String', () => {
    const testValue = 'simple text string';
    const writtenBuffer = bitUtils.writeString(testValue);
    const readValue = bitUtils.readString(writtenBuffer);

    expect(readValue.value).toBe(testValue);
    expect(readValue.offset).toBe(writtenBuffer.length);
  });

  it('should write and read UUID', () => {
    const testValue = new UUID('123e4567-e89b-12d3-a456-426614174000');
    const writtenBuffer = bitUtils.writeUUID(testValue);
    const readValue = bitUtils.readUUID(writtenBuffer);

    expect(readValue.value.toString()).toBe(testValue.toString());
    expect(readValue.offset).toBe(16);
  });

  it('should write and read Boolean', () => {
    const testTrue = true;
    const writtenBufferTrue = bitUtils.writeBoolean(testTrue);
    const readTrue = bitUtils.readBoolean(writtenBufferTrue);
    expect(readTrue.value).toBe(true);
    expect(readTrue.offset).toBe(1);

    const testFalse = false;
    const writtenBufferFalse = bitUtils.writeBoolean(testFalse);
    const readFalse = bitUtils.readBoolean(writtenBufferFalse);
    expect(readFalse.value).toBe(false);
    expect(readFalse.offset).toBe(1);
  });
});
