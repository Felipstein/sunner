import { InvalidJSONParseError } from '../core/errors/invalid-json-parse';
import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';
import { bitUtils } from '../utils/bit';

import { StatusResponsePayload } from './types/status-response-payload';

export class StatusResponsePacket extends Packet {
  static readonly PACKET_ID = 0x00;

  constructor(readonly payload: StatusResponsePayload) {
    super(StatusResponsePacket.PACKET_ID);
  }

  protected override dataToBuffer() {
    return bitUtils.writeString(JSON.stringify(this.payload));
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    let payload: StatusResponsePayload;
    try {
      payload = bufferIterator.readJSON<StatusResponsePayload>();
    } catch (error: unknown) {
      if (error instanceof InvalidJSONParseError) {
        throw new Error(
          `Invalid payload received for ${this.constructor.name}. Payload: ${error.invalidJSON}`,
        );
      }

      throw error;
    }

    const packet = new StatusResponsePacket(payload);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
