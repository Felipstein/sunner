import fs from 'node:fs';
import path from 'node:path';

import { worldDir } from '@application/shared/worldDir';

import { getSeed } from './get-seed';

describe('getSeed()', () => {
  it('should return exactly seed expected', async () => {
    const levelDatPath = path.resolve(worldDir, 'level.dat');
    const levelDatContent = fs.readFileSync(levelDatPath);

    const seed = await getSeed(levelDatContent);

    expect(seed.toString()).toBe('-2695777945317657121');
  });
});
