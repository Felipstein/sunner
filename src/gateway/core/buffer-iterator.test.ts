import { bitUtils } from '../utils/bit';

import { BufferIterator } from './buffer-iterator';

describe('Buffer Iterator', () => {
  it('should write and read VarInt', () => {
    const buffer = new BufferIterator(Buffer.from([0x7f, 0xff]));

    expect(buffer.readVarInt()).toBe(0x7f);
  });

  it('should write and read all types', () => {
    const plainData = [20, 'Hello World', 50, { text: 'Hi' }] as const;

    const data1 = bitUtils.writeVarInt(plainData[0]);
    const data2 = bitUtils.writeString(plainData[1]);
    const data3 = bitUtils.writeVarInt(plainData[2]);
    const data4 = bitUtils.writeString(JSON.stringify(plainData[3]));

    const rawBuffer = Buffer.concat([data1, data2, data3, data4]);

    const buffer = new BufferIterator(rawBuffer);

    expect(buffer.readVarInt()).toBe(plainData[0]);
    expect(buffer.readString()).toBe(plainData[1]);
    expect(buffer.readVarInt()).toBe(plainData[2]);
    expect(buffer.readJSON()).toEqual(plainData[3]);
  });
});
