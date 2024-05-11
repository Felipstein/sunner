import { promisify } from 'node:util';
import zlib from 'node:zlib';

import nbt from 'prismarine-nbt';

export async function getSeed(levelDatContent: Buffer) {
  const content = await tryDecompress(levelDatContent);

  const { parsed } = await nbt.parse(content, 'big');

  return validateNBTAndExtractSeed(parsed);
}

const gunzip = promisify(zlib.gunzip);

async function tryDecompress(content: Buffer) {
  let contentDecompressed = content;
  try {
    contentDecompressed = await gunzip(content);
  } catch {}

  return contentDecompressed;
}

function validateNBTAndExtractSeed(parsedData: nbt.NBT): bigint | never {
  const dataValue = parsedData.value.Data?.value;

  if (!dataValue || typeof dataValue !== 'object' || !('WorldGenSettings' in dataValue)) {
    throw new Error('Invalid level.dat content');
  }

  const worldGenSettingsData = dataValue.WorldGenSettings?.value;

  if (
    !worldGenSettingsData ||
    typeof worldGenSettingsData !== 'object' ||
    !('seed' in worldGenSettingsData)
  ) {
    throw new Error('Invalid level.dat content');
  }

  const seed = worldGenSettingsData.seed?.value;

  if (!seed) {
    throw new Error('Seed value not found in level.dat content');
  }

  return seed as unknown as bigint;
}
