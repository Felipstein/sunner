import { JSONTextComponent } from '../../shared/json-text-component';
import { InvalidJSONParseError } from '../core/errors/invalid-json-parse';
import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';
import { bitUtils } from '../utils/bit';

export class DisconnectLoginPacket extends Packet {
  static readonly PACKET_ID = 0x00;

  constructor(readonly reason: JSONTextComponent) {
    super(DisconnectLoginPacket.PACKET_ID);
  }

  protected override onlyDataToBuffer(): Buffer {
    return bitUtils.writeString(JSON.stringify(this.reason));
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    let reason: JSONTextComponent;
    try {
      reason = bufferIterator.readJSON() as JSONTextComponent;
    } catch (error: unknown) {
      if (error instanceof InvalidJSONParseError) {
        throw new Error(
          `Invalid reason received for ${this.constructor.name}. Reason: ${error.invalidJSON}`,
        );
      }

      throw error;
    }

    const packet = new DisconnectLoginPacket(reason);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
