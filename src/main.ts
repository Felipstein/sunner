import chalk from 'chalk';

import { CoreServer } from './application/gateway/core/core-server';
import { NodeCoreServer } from './driver/node-core-server';

const coreServer: CoreServer = new NodeCoreServer();

export async function main() {
  console.info(chalk.gray('Starting server...'));

  await coreServer.init();
}

main();

export { coreServer };
