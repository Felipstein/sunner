import { bitUtils } from '../utils/bit';

import { Packet } from './packet';

describe('Packet Class', () => {
  it('should restore Packet Class from Buffer', () => {
    const data = 'Simple Data';
    const packetId = 0x00;

    const bufferedData = bitUtils.writeString(data);
    const bufferedPacketId = bitUtils.writeVarInt(packetId);
    const length = bufferedData.length + bufferedPacketId.length;
    const bufferedLength = bitUtils.writeVarInt(length);

    const buffer = Buffer.concat([bufferedLength, bufferedPacketId, bufferedData]);

    const packet = Packet.fromBuffer(buffer);

    expect(packet.id).toBe(packetId);
    expect(packet.length).toBe(length);
    expect(packet.data.length).toBe(bufferedData.length);
    expect(packet.data).toEqual(bufferedData);
  });

  it('should restore exactly JSON data of Packet Class from Buffer', () => {
    const data = {
      version: { name: '1.20.4', protocol: 765 },
      description: { text: 'Simple text' },
    };
    const dataInJSON = JSON.stringify(data);
    const packetId = 0x00;

    const bufferedData = bitUtils.writeString(dataInJSON);
    const bufferedPacketId = bitUtils.writeVarInt(packetId);
    const length = bufferedData.length + bufferedPacketId.length;
    const bufferedLength = bitUtils.writeVarInt(length);

    const buffer = Buffer.concat([bufferedLength, bufferedPacketId, bufferedData]);

    const packet = Packet.fromBuffer(buffer);

    const { value: dataPacketToString } = bitUtils.readString(packet.data);

    expect(dataPacketToString).toBe(dataInJSON);
    expect(JSON.parse(dataPacketToString)).toEqual(data);
  });

  it.each(['Hello World', { text: 'Hello World' }, 20])(
    'should create Packet with single data',
    (data) => {
      const packetId = 0x00;

      const packet = Packet.create(packetId, data);

      expect(packet.id).toBe(packetId);
      expect(packet.data).toBeInstanceOf(Buffer);
    },
  );

  it('should create Packet with single data and recover exactly data', () => {
    const packetId = 0x00;
    const data = { name: 'Felipe', message: 'Hello my friends!' };

    const packet = Packet.create(packetId, data);

    expect(packet.id).toBe(packetId);
    expect(packet.data).toBeInstanceOf(Buffer);

    const { value: dataPacketToString } = bitUtils.readString(packet.data);

    expect(dataPacketToString).toBe(JSON.stringify(data));

    const dataParsedRecovered = JSON.parse(dataPacketToString) as typeof data;
    expect(dataParsedRecovered.name).toBe(data.name);
    expect(dataParsedRecovered.message).toBe(data.message);
  });

  it('should create Packet with multi datas', () => {
    const packetId = 0x00;
    const data = [20, 'Hello World', 50, { name: 'Felipe' }];

    const packet = Packet.create(packetId, ...data);

    expect(packet.data).toBeInstanceOf(Buffer);

    const { value: packetData1, offset: after1 } = bitUtils.readVarInt(packet.data);
    const { value: packetData2, offset: after2 } = bitUtils.readString(packet.data, after1);
    const { value: packetData3, offset: after3 } = bitUtils.readVarInt(packet.data, after2);
    const { value: packetData4 } = bitUtils.readString(packet.data, after3);

    expect(packetData1).toBe(data[0]);
    expect(packetData2).toBe(data[1]);
    expect(packetData3).toBe(data[2]);
    expect(packetData4).toBe(JSON.stringify(data[3]));
  });

  it('should restore the same Buffer after Packet creation', () => {
    const packetId = 0x00;
    const data = [20, 'Hello World', 50, { name: 'Felipe' }];

    const bufferedPacketId = bitUtils.writeVarInt(packetId);
    const bufferedData = bitUtils.writeString(JSON.stringify(data));
    const bufferedLength = bitUtils.writeVarInt(bufferedData.length + bufferedPacketId.length);
    const buffer = Buffer.concat([bufferedLength, bufferedPacketId, bufferedData]);

    const packet = Packet.fromBuffer(buffer);

    expect(packet.toBuffer()).toEqual(buffer);
    expect(packet.toBuffer().length).toBe(buffer.length);
  });
});
