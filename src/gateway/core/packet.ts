import { bitUtils } from '../utils/bit';

export class Packet {
  private constructor(
    readonly length: number,
    readonly id: number,
    readonly data: Buffer,
  ) {}

  toBuffer() {
    const bufferedId = bitUtils.writeVarInt(this.id);
    const bufferedData = this.data;
    const bufferedLength = bitUtils.writeVarInt(this.length);

    return Buffer.concat([bufferedLength, bufferedId, bufferedData]);
  }

  static fromBuffer(buffer: Buffer) {
    const { value: packetLength, offset: offsetAfterPacketLength } = bitUtils.readVarInt(buffer);

    const { value: packetId, offset: offsetAfterPacketId } = bitUtils.readVarInt(
      buffer,
      offsetAfterPacketLength,
    );

    return new Packet(packetLength, packetId, buffer.subarray(offsetAfterPacketId));
  }

  static create(id: number, ...params: any[]) {
    const bufferedId = bitUtils.writeVarInt(id);
    const bufferedData = this.serializeDataList(params);
    const length = bufferedData.length + bufferedId.length;

    return new Packet(length, id, bufferedData);
  }

  private static serializeData(data: any) {
    if (data instanceof Buffer) {
      return data;
    }

    if (typeof data === 'string') {
      return bitUtils.writeString(data);
    }

    if (typeof data === 'number') {
      return bitUtils.writeVarInt(data);
    }

    if (typeof data === 'object') {
      return bitUtils.writeString(JSON.stringify(data));
    }

    throw new Error(`Unknown data type to serialize: ${typeof data}`);
  }

  private static serializeDataList(dataList: any[]) {
    let bufferedData: Buffer;

    if (dataList.length === 1 || !Array.isArray(dataList)) {
      const data = Array.isArray(dataList) ? dataList[0] : dataList;

      bufferedData = this.serializeData(data);
    } else {
      const bufferedDataList = dataList.map(this.serializeData.bind(this));

      bufferedData = Buffer.concat(bufferedDataList);
    }

    return bufferedData;
  }
}
