import { Packet } from '../core/packet';
import { bitUtils } from '../utils/bit';

import { UnknownPacket } from './unknown-packet';

export class EncryptionResponsePacket extends Packet {
  static readonly PACKET_ID = 0x01;

  constructor(
    readonly sharedSecret: Buffer,
    readonly verifyToken: Buffer,
  ) {
    super(EncryptionResponsePacket.PACKET_ID);
  }

  override get totalLength() {
    const bufferedSharedSecretLength = bitUtils.writeVarInt(this.sharedSecret.length);
    const bufferedVerifyTokenLength = bitUtils.writeVarInt(this.verifyToken.length);

    return this.calculateLength(
      bufferedSharedSecretLength,
      this.sharedSecret,
      bufferedVerifyTokenLength,
      this.verifyToken,
    );
  }

  override toBuffer() {
    const bufferedSharedSecretLength = bitUtils.writeVarInt(this.sharedSecret.length);
    const bufferedVerifyTokenLength = bitUtils.writeVarInt(this.verifyToken.length);

    return this.compact(
      bufferedSharedSecretLength,
      this.sharedSecret,
      bufferedVerifyTokenLength,
      this.verifyToken,
    );
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const sharedSecretLength = bufferIterator.readVarInt();
    const sharedSecret = bufferIterator.readBytes(sharedSecretLength);
    const verifyTokenLength = bufferIterator.readVarInt();
    const verifyToken = bufferIterator.readBytes(verifyTokenLength);

    const packet = new EncryptionResponsePacket(sharedSecret, verifyToken);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
