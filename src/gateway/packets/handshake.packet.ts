import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';
import { bitUtils } from '../utils/bit';

type NextState = 1 | 2;

export class HandshakePacket extends Packet {
  static readonly PACKET_ID = 0x00;

  constructor(
    readonly protocolVersion: number,
    readonly serverAddress: string,
    readonly serverPort: number,
    readonly nextState: NextState,
  ) {
    super(HandshakePacket.PACKET_ID);
  }

  override get totalLength() {
    const bufferedProtocolVersion = bitUtils.writeVarInt(this.protocolVersion);
    const bufferedServerAddress = bitUtils.writeString(this.serverAddress);
    const bufferedServerPort = bitUtils.writeShort(this.serverPort);
    const bufferedNextState = bitUtils.writeVarInt(this.nextState);

    return this.calculateLength(
      bufferedProtocolVersion,
      bufferedServerAddress,
      bufferedServerPort,
      bufferedNextState,
    );
  }

  override toBuffer() {
    const bufferedProtocolVersion = bitUtils.writeVarInt(this.protocolVersion);
    const bufferedServerAddress = bitUtils.writeString(this.serverAddress);
    const bufferedServerPort = bitUtils.writeShort(this.serverPort);
    const bufferedNextState = bitUtils.writeVarInt(this.nextState);

    return this.compact(
      bufferedProtocolVersion,
      bufferedServerAddress,
      bufferedServerPort,
      bufferedNextState,
    );
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const protocolVersion = bufferIterator.readVarInt();
    const serverAddress = bufferIterator.readString();
    const serverPort = bufferIterator.readShort();
    const nextState = bufferIterator.readVarInt();

    if (nextState !== 1 && nextState !== 2) {
      throw new Error(
        `Invalid next state received for ${this.constructor.name}. Expected: 1 or 2, received: ${nextState}`,
      );
    }

    const packet = new HandshakePacket(protocolVersion, serverAddress, serverPort, nextState);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
