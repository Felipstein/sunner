import { UUID } from '../../shared/value-objects/uuid';
import { Packet } from '../core/packet';
import { UnknownPacket } from '../core/unknown-packet';
import { bitUtils } from '../utils/bit';

interface PropertyDefaultFields {
  name: string;
  value: string;
}

type PropertySignature =
  | {
      isSigned: true;
      signature: string;
    }
  | {
      isSigned: false;
      signature?: string;
    };

type Property = PropertyDefaultFields & PropertySignature;

export class LoginSuccessPacket extends Packet {
  static readonly PACKET_ID = 0x02;

  constructor(
    readonly uuid: UUID,
    readonly username: string,
    readonly properties: Property[],
  ) {
    super(LoginSuccessPacket.PACKET_ID);
  }

  protected override dataToBuffer() {
    const bufferedUUID = bitUtils.writeUUID(this.uuid);
    const bufferedUsername = bitUtils.writeString(this.username);
    const bufferedPropertiesCount = bitUtils.writeVarInt(this.properties.length);
    const bufferedProperties = this.properties.map((prop) => {
      const bufferedName = bitUtils.writeString(prop.name);
      const bufferedValue = bitUtils.writeString(prop.value);
      const bufferedIsSigned = Buffer.from([prop.isSigned ? 1 : 0]);
      const bufferedSignature = prop.isSigned
        ? bitUtils.writeString(prop.signature)
        : Buffer.alloc(0);

      return Buffer.concat([bufferedName, bufferedValue, bufferedIsSigned, bufferedSignature]);
    });

    return [bufferedUUID, bufferedUsername, bufferedPropertiesCount, ...bufferedProperties];
  }

  static fromBuffer(buffer: Buffer) {
    const { packetLength, packetId, bufferIterator } = this.abstractPacketHeader(buffer);

    if (packetId !== this.PACKET_ID) {
      throw new Error(
        `Invalid packet ID expected for ${this.constructor.name}. Expected: ${this.PACKET_ID}, received: ${packetId}`,
      );
    }

    const uuid = bufferIterator.readUUID();
    const username = bufferIterator.readString();
    const propertiesCount = bufferIterator.readVarInt();
    const properties: Property[] = [];

    for (let i = 0; i < propertiesCount; i++) {
      const name = bufferIterator.readString();
      const value = bufferIterator.readString();
      const isSigned = bufferIterator.readBytes(1)[0] === 1;
      const signature = isSigned ? bufferIterator.readString() : undefined;

      const isSignedFixed = isSigned as false;
      properties.push({ name, value, isSigned: isSignedFixed, signature });
    }

    const packet = new LoginSuccessPacket(uuid, username, properties);
    packet.lengthFromHeader = packetLength;
    packet._lastOffset = bufferIterator.lastOffset;

    return packet;
  }

  static fromUnknownPacket(packet: UnknownPacket) {
    return this.fromBuffer(packet.toBuffer());
  }
}
