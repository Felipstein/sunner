import { UUID } from '../../shared/value-objects/uuid';
import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';
import { bitUtils } from '../utils/bit';

export class LoginStartPacket extends Packet {
  static readonly PACKET_ID = 0x00;

  constructor(
    readonly name: string,
    readonly playerUUID: UUID,
  ) {
    super(LoginStartPacket.PACKET_ID);
  }

  protected override onlyDataToBuffer() {
    const bufferedName = bitUtils.writeString(this.name);
    const bufferedPlayerUUID = bitUtils.writeUUID(this.playerUUID);

    return Buffer.concat([bufferedName, bufferedPlayerUUID]);
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
