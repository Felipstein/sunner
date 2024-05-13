import { PlayerAbilities } from '@domain/value-objects/player-abilities';
import { Packet } from '@gateway/core/packet';
import { UnknownPacket } from '@gateway/core/unknown-packet';
import { bitUtils } from '@gateway/utils/bit';

export class PlayerAbilitiesClientboundPacket extends Packet {
  static readonly PACKET_ID = 0x36;

  constructor(
    readonly flags: PlayerAbilities,
    readonly flyingSpeed: number = 0.05,
    readonly fieldOfViewModifier: number = 0.1,
  ) {
    super(PlayerAbilitiesClientboundPacket.PACKET_ID);
  }

  protected override dataToBuffer() {
    const bufferedFlags = bitUtils.writePlayerAbilities(this.flags);
    const bufferedFlyingSpeed = bitUtils.writeFloat(this.flyingSpeed);
    const bufferedFieldOfViewModifier = bitUtils.writeFloat(this.fieldOfViewModifier);

    return [bufferedFlags, bufferedFlyingSpeed, bufferedFieldOfViewModifier];
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const flags = bufferIterator.readPlayerAbilities();
    const flyingSpeed = bufferIterator.readFloat();
    const fieldOfViewModifier = bufferIterator.readFloat();

    const packet = new PlayerAbilitiesClientboundPacket(flags, flyingSpeed, fieldOfViewModifier);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(unknownPacket: UnknownPacket) {
    return this.fromBuffer(unknownPacket.toBuffer());
  }
}
