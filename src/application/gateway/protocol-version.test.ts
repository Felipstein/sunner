import { getMCVersionByProtocol } from './protocol-version';

describe('Protocol Version', () => {
  it('should return correct mc version by protocol version', () => {
    const protocolVersion = 765;

    expect(getMCVersionByProtocol(protocolVersion)).toBe('1.20.4');
  });

  it('should throw error if protocol version is not correct', () => {
    // @ts-expect-error
    expect(() => getMCVersionByProtocol(20)).toThrow(Error);
  });
});
