import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';
import { bitUtils } from '../utils/bit';

export class EncryptionResponsePacket extends Packet {
  static readonly PACKET_ID = 0x01;

  constructor(
    readonly sharedSecret: Buffer,
    readonly verifyToken: Buffer,
  ) {
    super(EncryptionResponsePacket.PACKET_ID);
  }

  protected override onlyDataToBuffer(): Buffer {
    const bufferedSharedSecretLength = bitUtils.writeVarInt(this.sharedSecret.length);
    const bufferedVerifyTokenLength = bitUtils.writeVarInt(this.verifyToken.length);

    return Buffer.concat([
      bufferedSharedSecretLength,
      this.sharedSecret,
      bufferedVerifyTokenLength,
      this.verifyToken,
    ]);
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
