import { bitUtils } from './gateway/utils/bit';

export function readPacket(buffer: Buffer) {
  let offset = 0;

  const { value: packetLength, offset: newOffset } = bitUtils.readVarInt(buffer, offset);
  offset = newOffset;

  const { value: packetId, offset: packetOffset } = bitUtils.readVarInt(buffer, offset);
  offset = packetOffset;

  return { id: packetId, length: packetLength, offset };
}
