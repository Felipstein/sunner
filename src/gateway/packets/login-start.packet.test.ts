import { UUID } from '../../shared/value-objects/uuid';

import { LoginStartPacket } from './login-start.packet';

describe('LoginStartPacket', () => {
  const playerName = 'Felipe';
  const playerUUID = new UUID('123e4567-e89b-12d3-a456-426614174000');

  it('should create a packet with the correct ID', () => {
    const packet = new LoginStartPacket(playerName, playerUUID);

    expect(packet.id).toBe(LoginStartPacket.PACKET_ID);
  });

  it('should serialize and deserialize from a buffer correctly', () => {
    const originalPacket = new LoginStartPacket(playerName, playerUUID);
    const buffer = originalPacket.toBuffer();
    const deserializedPacket = LoginStartPacket.fromBuffer(buffer);

    expect(deserializedPacket.name).toEqual(playerName);
    expect(deserializedPacket.playerUUID).toEqual(playerUUID);
  });

  it('should throw an error for invalid packet ID during deserialization', () => {
    const wrongIdBuffer = Buffer.from([0x01, 0x00, 0x06, 0x04]);

    expect(() => LoginStartPacket.fromBuffer(wrongIdBuffer)).toThrow(Error);
  });
});
