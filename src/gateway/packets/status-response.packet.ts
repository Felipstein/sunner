import { InvalidJSONParseError } from '../core/errors/invalid-json-parse';
import { Packet } from '../core/packet';
import { bitUtils } from '../utils/bit';

import { StatusResponsePayload } from './types/status-response-payload';
import { UnknownPacket } from '../core/unknown-packet';

export class StatusResponsePacket extends Packet {
  static readonly PACKET_ID = 0x00;

  constructor(readonly payload: StatusResponsePayload) {
    super(StatusResponsePacket.PACKET_ID);
  }

  override get totalLength() {
    const bufferedData = bitUtils.writeString(JSON.stringify(this.payload));

    return this.calculateLength(bufferedData);
  }

  override toBuffer() {
    const bufferedData = bitUtils.writeString(JSON.stringify(this.payload));

    return this.compact(bufferedData);
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
