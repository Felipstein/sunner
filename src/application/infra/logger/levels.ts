/* eslint-disable no-console */

import chalk, { Chalk } from 'chalk';

type ConsoleFunction =
  | typeof console.log
  | typeof console.debug
  | typeof console.info
  | typeof console.error
  | typeof console.warn;

type LevelName =
  | 'INFO'
  | 'PROMISE'
  | 'SUCCESS'
  | 'WARN'
  | 'ERROR'
  | 'FATAL'
  | 'DEBUG_PACKET'
  | 'DEBUG';

type LevelNameLowerCase =
  | 'info'
  | 'promise'
  | 'success'
  | 'warn'
  | 'error'
  | 'fatal'
  | 'debug_packet'
  | 'debug';

export class Level {
  static readonly INFO = new Level('INFO', console.info, chalk.reset);
  static readonly PROMISE = new Level(
    'PROMISE',
    console.info,
    chalk.rgb(172, 172, 172),
    chalk.gray.italic,
  );
  static readonly SUCCESS = new Level('SUCCESS', console.info, chalk.green);
  static readonly WARN = new Level('WARN', console.warn, chalk.yellow);
  static readonly ERROR = new Level('ERROR', console.error, chalk.red);
  static readonly FATAL = new Level('FATAL', console.error, chalk.rgb(255, 0, 0), chalk.red);
  static readonly DEBUG_PACKET = new Level('DEBUG_PACKET', console.debug, chalk.blue);
  static readonly DEBUG = new Level('DEBUG', console.debug, chalk.magenta);

  constructor(
    private readonly name: LevelName,
    readonly consoleFunction: ConsoleFunction,
    readonly color: Chalk,
    readonly messageColor: Chalk | null = null,
  ) {}

  get level() {
    return this.name.toLowerCase() as LevelNameLowerCase;
  }

  toString(withColor = true) {
    return withColor ? this.color.bold(this.name) : this.name;
  }

  equals(value: unknown) {
    if (!value || !(value instanceof Level)) {
      return false;
    }

    return this.name === value.name;
  }
}
