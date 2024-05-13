import './env';

import chalk from 'chalk';

import { CoreServer } from './application/gateway/core/core-server';
import { loggers } from './application/infra/logger/constants';
import { NodeCoreServer } from './driver/node-core-server';

const coreServer: CoreServer = new NodeCoreServer();

export async function main() {
  const { hostname, port } = await coreServer.init();

  loggers.server.info(
    chalk.gray('Server is running on'),
    chalk.cyan.underline(`${hostname}:${port}`),
  );
  loggers.server.ln();
}

main();
