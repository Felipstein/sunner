import '@env';

import { UUID } from '@domain/value-objects/uuid';
import { UnknownPacket } from '@gateway/core/unknown-packet';
import { ProtocolVersion } from '@gateway/protocol-version';

import { bitUtils } from './bit';
import { decompressPacket } from './decompress-packet';

function createHandshakePacket() {
  const bufferedProtocolVersion = bitUtils.writeVarInt(ProtocolVersion.V1_20_4);
  const bufferedServerAddress = bitUtils.writeString('localhost');
  const bufferedServerPort = bitUtils.writeShort(25565);
  const bufferedNextState = bitUtils.writeVarInt(2);

  const bufferedData = Buffer.concat([
    bufferedProtocolVersion,
    bufferedServerAddress,
    bufferedServerPort,
    bufferedNextState,
  ]);

  const bufferedPacketId = bitUtils.writeVarInt(0x00);
  const bufferedLength = bitUtils.writeVarInt(bufferedPacketId.length + bufferedData.length);

  return UnknownPacket.fromBuffer(Buffer.concat([bufferedLength, bufferedPacketId, bufferedData]));
}

function createLoginPacket() {
  const bufferedName = bitUtils.writeString('Felipe');
  const bufferedUUID = bitUtils.writeUUID(new UUID('123e4567-e89b-12d3-a456-426614174000'));

  const bufferedData = Buffer.concat([bufferedName, bufferedUUID]);

  const bufferedPacketId = bitUtils.writeVarInt(0x00);
  const bufferedLength = bitUtils.writeVarInt(bufferedPacketId.length + bufferedData.length);

  return UnknownPacket.fromBuffer(Buffer.concat([bufferedLength, bufferedPacketId, bufferedData]));
}

describe('decompressPacket()', () => {
  it('should decompress packet', () => {
    const packets = [createHandshakePacket(), createLoginPacket()];

    const compressedPacketBuffer = Buffer.concat([packets[0].toBuffer(), packets[1].toBuffer()]);
    const compressedPacket = UnknownPacket.fromBuffer(compressedPacketBuffer);

    let index = 0;
    decompressPacket(compressedPacket, (decompressedPacket) => {
      const originalPacket = packets[index];

      expect(originalPacket.id).toBe(decompressedPacket.id);
      expect(originalPacket.length).toBe(decompressedPacket.length);
      expect(originalPacket.data).toEqual(decompressedPacket.data);

      ++index;
    });

    const decompressedPacketsUsingList = decompressPacket(compressedPacket);
    expect(decompressedPacketsUsingList.length).toBe(packets.length);
  });

  it('should return decompressed packets list if callback is not provided', () => {
    const packet = createHandshakePacket();

    const decompressedPackets = decompressPacket(packet);

    expect(decompressedPackets).toBeDefined();
    expect(decompressedPackets.length).toBeDefined();
    expect(decompressedPackets.length).toBe(1);
  });

  it('should not return decompressed packets list if callback is provided', () => {
    const packet = createHandshakePacket();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const decompressedPackets = decompressPacket(packet, () => {});

    expect(decompressedPackets).toBeUndefined();
  });
});
