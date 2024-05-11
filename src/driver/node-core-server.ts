import net from 'node:net';

import chalk from 'chalk';

import { Connection } from '../application/gateway/core/connection';
import { CoreServer } from '../application/gateway/core/core-server';

import { serverConfig } from './server-config';

export class NodeCoreServer extends CoreServer {
  private readonly netServer: net.Server;

  constructor() {
    super();

    this.netServer = net.createServer();

    this.netServer.on('error', this.onError);
    this.netServer.on('connection', (socket) => this.onConnect(new Connection(socket)));
  }

  override init(): Promise<void> {
    return new Promise((resolve) => {
      const { port, hostname } = serverConfig;

      this.netServer.listen(port, hostname);
      this.netServer.once('listening', () => {
        console.info(
          chalk.gray('Server is running on'),
          chalk.cyan.underline(`${hostname}:${port}`),
          '\n',
        );

        resolve();
      });
    });
  }
}
