export const mcVersions = [
  '1.20.4',
  '1.20.3',
  '1.20.2',
  '1.20.1',
  '1.20',
  '1.19.4',
  '1.19.3',
  '1.19.2',
  '1.19',
] as const;

export type MCVersion = (typeof mcVersions)[number];

export enum ProtocolVersion {
  V1_20_4 = 765,
  V1_20_3 = 765,
  V1_20_2 = 764,
  V1_20_1 = 763,
  V1_20 = 763,
  V1_19_4 = 762,
  V1_19_3 = 761,
  V1_19_2 = 760,
  V1_19 = 759,
}

export function getMCVersionByProtocol(protocolNumber: ProtocolVersion) {
  for (const [mcVersion, value] of Object.entries(ProtocolVersion)) {
    if (value === protocolNumber) {
      return mcVersion.replace('V', '').replaceAll('_', '.') as MCVersion;
    }
  }

  throw new Error(`Unknown protocol version: ${protocolNumber}`);
}
