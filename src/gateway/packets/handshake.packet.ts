import { Packet } from '../core/packet';
import { bitUtils } from '../utils/bit';

export class HandshakePacket extends Packet {
  static readonly PACKET_ID = 0x00;

  static create(
    protocolVersion: number,
    serverAddress: string,
    serverPort: number,
    nextStatic: 1 | 2,
  ) {
    const bufferedVersion = bitUtils.writeVarInt(protocolVersion);
    const bufferedServerAddress = bitUtils.writeString(serverAddress);
    const bufferedServerPort = Buffer.alloc(2);
    bufferedServerPort.writeUint16BE(serverPort, 0);
    const bufferedNextStatic = bitUtils.writeVarInt(nextStatic);

    const data = Buffer.concat([
      bufferedVersion,
      bufferedServerAddress,
      bufferedServerPort,
      bufferedNextStatic,
    ]);
    const length = data.length + bitUtils.writeVarInt(this.PACKET_ID).length;

    return new HandshakePacket(length, this.PACKET_ID, data);
  }

  static fromBuffer(buffer: Buffer) {
    return super.fromBuffer(buffer);
  }
}
