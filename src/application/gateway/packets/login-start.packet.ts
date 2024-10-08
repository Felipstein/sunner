import { UUID } from '@domain/value-objects/uuid';
import { Packet } from '@gateway/core/packet';
import { UnknownPacket } from '@gateway/core/unknown-packet';
import { bitUtils } from '@gateway/utils/bit';

export class LoginStartPacket extends Packet {
  static readonly PACKET_ID = 0x00;

  constructor(
    readonly name: string,
    readonly playerUUID: UUID,
  ) {
    super(LoginStartPacket.PACKET_ID);
  }

  protected override dataToBuffer() {
    const bufferedName = bitUtils.writeString(this.name);
    const bufferedPlayerUUID = bitUtils.writeUUID(this.playerUUID);

    return [bufferedName, bufferedPlayerUUID];
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const name = bufferIterator.readString();
    const playerUUID = bufferIterator.readUUID();

    const packet = new LoginStartPacket(name, playerUUID);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
