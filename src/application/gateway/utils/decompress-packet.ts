import chalk from 'chalk';

import { Logger } from '../../infra/logger';
import { UnknownPacket } from '../core/unknown-packet';

const log = Logger.init('DECOMPRESS_PACKET');

type Callback = (decompressedPacket: UnknownPacket) => void;

export function decompressPacket(unknownPacket: UnknownPacket): UnknownPacket[];
export function decompressPacket(unknownPacket: UnknownPacket, callback: Callback): void;

export function decompressPacket(unknownPacket: UnknownPacket, callback?: Callback) {
  const decompressedPackets: UnknownPacket[] = [];

  let offset = 0;
  let index = 0;

  while (offset < unknownPacket.totalLength) {
    const packet = unknownPacket.slice(offset, index === 0 ? unknownPacket.length + 1 : undefined);

    if (!packet.compressed) {
      if (callback) {
        callback(packet);
      } else {
        decompressedPackets.push(packet);
      }
    } else {
      log.warn(
        chalk.yellow(
          `Packet (${packet.hexId()}) is compressed. Actually the code does not support this. The package is will be ignored.`,
        ),
      );
    }

    offset += packet.length + 1;
    index++;
  }

  return !callback ? decompressedPackets : undefined;
}
