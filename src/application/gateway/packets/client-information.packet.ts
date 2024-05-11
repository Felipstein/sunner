import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';
import { bitUtils } from '../utils/bit';

export class ClientInformationPacket extends Packet {
  static readonly PACKET_ID = 0x00;

  constructor(
    readonly locale: string,
    readonly viewDistance: number,
    readonly chatMode: 0 | 1 | 2,
    readonly chatColors: boolean,
    readonly displayedSkinParts: number,
    readonly mainHand: 0 | 1,
    readonly enableTextFiltering: boolean,
    readonly allowServerListings: boolean,
  ) {
    super(ClientInformationPacket.PACKET_ID);
  }

  protected override dataToBuffer() {
    const bufferedLocale = bitUtils.writeString(this.locale);
    const bufferedViewDistance = bitUtils.writeByte(this.viewDistance);
    const bufferedChatMode = bitUtils.writeVarInt(this.chatMode);
    const bufferedChatColors = bitUtils.writeBoolean(this.chatColors);
    const bufferedDisplayedSkinParts = bitUtils.writeByte(this.displayedSkinParts);
    const bufferedMainHand = bitUtils.writeVarInt(this.mainHand);
    const bufferedEnableTextFiltering = bitUtils.writeBoolean(this.enableTextFiltering);
    const bufferedAllowServerListings = bitUtils.writeBoolean(this.allowServerListings);

    return [
      bufferedLocale,
      bufferedViewDistance,
      bufferedChatMode,
      bufferedChatColors,
      bufferedDisplayedSkinParts,
      bufferedMainHand,
      bufferedEnableTextFiltering,
      bufferedAllowServerListings,
    ];
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const locale = bufferIterator.readString();
    const viewDistance = bufferIterator.readByte();
    const chatMode = bufferIterator.readVarInt();
    const chatColors = bufferIterator.readBoolean();
    const displayedSkinParts = bufferIterator.readByte();
    const mainHand = bufferIterator.readVarInt();
    const enableTextFiltering = bufferIterator.readBoolean();
    const allowServerListings = bufferIterator.readBoolean();

    const packet = new ClientInformationPacket(
      locale,
      viewDistance,
      chatMode as 0 | 1 | 2,
      chatColors,
      displayedSkinParts,
      mainHand as 0 | 1,
      enableTextFiltering,
      allowServerListings,
    );
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
