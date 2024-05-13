import { Packet } from '@gateway/core/packet';
import { UnknownPacket } from '@gateway/core/unknown-packet';
import { bitUtils } from '@gateway/utils/bit';

export class EncryptionRequestPacket extends Packet {
  static readonly PACKET_ID = 0x01;

  private readonly serverId = '';

  constructor(
    readonly publicKey: Buffer,
    readonly verifyToken: Buffer,
  ) {
    super(EncryptionRequestPacket.PACKET_ID);
  }

  protected override dataToBuffer() {
    const bufferedServerId = bitUtils.writeString(this.serverId);
    const bufferedPublicKeyLength = bitUtils.writeVarInt(this.publicKey.length);
    const bufferedVerifyTokenLength = bitUtils.writeVarInt(this.verifyToken.length);

    return [
      bufferedServerId,
      bufferedPublicKeyLength,
      this.publicKey,
      bufferedVerifyTokenLength,
      this.verifyToken,
    ];
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    // Unused serverId field
    bufferIterator.readString();
    const publicKeyLength = bufferIterator.readVarInt();
    const publicKey = bufferIterator.readBytes(publicKeyLength);
    const verifyTokenLength = bufferIterator.readVarInt();
    const verifyToken = bufferIterator.readBytes(verifyTokenLength);

    const packet = new EncryptionRequestPacket(publicKey, verifyToken);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
