import net from 'node:net';

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

  override init(): Promise<{ hostname: string; port: number }> {
    return new Promise((resolve) => {
      const { port, hostname } = serverConfig;

      this.netServer.listen(port, hostname);
      this.netServer.once('listening', () => {
        resolve({ hostname, port });
      });
    });
  }
}
