/* eslint-disable max-classes-per-file */
import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import _ from 'lodash';
import moment from 'moment';

import { Level } from './levels';

type EnabledLevels = Record<Level['level'], boolean>;

interface Config {
  showMilliseconds: boolean;
  autoStringifyObjects: boolean;
  autoStringifyObjectsIndent: number | null;
  autoStringifyObjectsColored: boolean;
  logsDir: string;
  crashesDir: string;
  storeLogs: boolean;
}

const defaultConfig: Config = {
  showMilliseconds: false,
  autoStringifyObjects: false,
  autoStringifyObjectsIndent: null,
  autoStringifyObjectsColored: true,
  logsDir: path.resolve('tmp', 'logs'),
  crashesDir: path.resolve('tmp', 'crashes'),
  storeLogs: process.env.STORE_LOGS,
};

class Logger {
  private readonly contexts = new Set<string>();

  private constructor(
    public levels: EnabledLevels,
    public config: Config,
  ) {}

  start(context: string) {
    this.contexts.add(context.toUpperCase());
  }

  end(context: string) {
    this.contexts.delete(context.toUpperCase());
  }

  info(...params: any[]) {
    this.log(Level.INFO, ...params);
  }

  promise(...params: any[]) {
    this.log(Level.PROMISE, ...params);
  }

  success(...params: any[]) {
    this.log(Level.SUCCESS, ...params);
  }

  warn(...params: any[]) {
    this.log(Level.WARN, ...params);
  }

  error(...params: any[]) {
    this.log(Level.ERROR, ...params);
  }

  fatal(...params: any[]) {
    this.log(Level.FATAL, ...params);
  }

  debug(...params: any[]) {
    this.log(Level.DEBUG, ...params);
  }

  debugPacket(...params: any[]) {
    this.log(Level.DEBUG_PACKET, ...params);
  }

  log(level: Level, ...params: any[]) {
    if (level.level === 'info' && !this.levels.info) return;
    if (level.level === 'promise' && !this.levels.promise) return;
    if (level.level === 'success' && !this.levels.success) return;
    if (level.level === 'warn' && !this.levels.warn) return;
    if (level.level === 'error' && !this.levels.error) return;
    if (level.level === 'fatal' && !this.levels.fatal) return;
    if (level.level === 'debug' && !this.levels.debug) return;
    if (level.level === 'debug_packet' && !this.levels.debug_packet) return;

    const paramsMapped = params.map((param) => {
      let paramMapped = param;

      if (this.config.autoStringifyObjects && typeof param === 'object' && param !== null) {
        paramMapped =
          this.config.autoStringifyObjectsIndent !== null
            ? JSON.stringify(param, null, this.config.autoStringifyObjectsIndent)
            : JSON.stringify(param);
      }

      if (
        (this.config.autoStringifyObjects && this.config.autoStringifyObjectsColored
          ? typeof paramMapped === 'string'
          : typeof param === 'string') &&
        level.messageColor
      ) {
        paramMapped = level.messageColor(paramMapped);
      }

      return paramMapped;
    });

    const tags = `${this.timestamp()} ${this.prefix(level)}`;
    level.consoleFunction(tags, ...paramsMapped);

    if (this.config.storeLogs) {
      this.storeLogs(level, tags, params);
    }
  }

  ln(repeat = 0) {
    // eslint-disable-next-line no-console
    console.info('\n'.repeat(repeat));
  }

  private storeLogs(level: Level, tags: string, params: any[]) {
    const content = this.cleanupParams(level.level === 'fatal' ? params : [tags, ...params]);

    let logPath: string;

    if (level.level === 'fatal') {
      logPath = path.resolve(
        this.config.crashesDir,
        `${moment().format('YYYY-MM-DD-HH-mm-ss')}-crashes.txt`,
      );
    } else {
      logPath = path.resolve(this.config.logsDir, `${moment().format('YYYY-MM-DD')}-logs.txt`);
    }

    fs.appendFile(logPath, content.concat('\n'), 'utf-8', (error) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.error(chalk.red('An error occurred while save the log:'), error);
      }
    });
  }

  private cleanupParams(params: any[]) {
    const content = params
      .map((param) => {
        if (!param) {
          return '';
        }

        if (param instanceof Error) {
          const errorObj = {
            ...param,
            name: param.name,
            message: param.message,
            cause: param.cause,
            stack: param.stack,
          };

          return JSON.stringify(errorObj, null, this.config.autoStringifyObjectsIndent ?? 2);
        }

        if (typeof param !== 'string') {
          return this.config.autoStringifyObjectsIndent
            ? JSON.stringify(param, null, this.config.autoStringifyObjectsIndent)
            : JSON.stringify(param);
        }

        return param.replace(/\x1b\[[0-9;]*m/g, '');
      })
      .join(' ');

    return content;
  }

  private prefix(level: Level) {
    const openBracket = level.color('[');
    const closeBracket = level.color(']');

    let prefix: string;
    if (this.contexts.size > 0) {
      const contexts = level.color(Array.from(this.contexts).join('/'));
      prefix = `${level.toString()}${level.color('/')}${contexts}`;
    } else {
      prefix = `${level.toString()}`;
    }

    return `${openBracket}${prefix}${closeBracket}`;
  }

  private timestamp() {
    return chalk.gray(
      `[${moment().format(this.config.showMilliseconds ? 'YYYY-MM-DD HH:mm:ss.SSS' : 'YYYY-MM-DD HH:mm:ss')}]`,
    );
  }

  static init(
    contextOrContexts: string[] | string | null = [],
    enabledLevels: EnabledLevels | 'all' = 'all',
    config: Partial<Config> | undefined = undefined,
  ) {
    const contexts = Array.isArray(contextOrContexts)
      ? contextOrContexts
      : contextOrContexts === null
        ? []
        : [contextOrContexts];

    const defaultConfigMerged = _.merge({}, defaultConfig, config);

    const defaultEnabledLogs = process.env.LOGS;
    const defaultEnabledInfoLevel = defaultEnabledLogs.includes('info');
    const defaultEnabledPromiseLevel = defaultEnabledLogs.includes('promise');
    const defaultEnabledSuccessLevel = defaultEnabledLogs.includes('success');
    const defaultEnabledWarnLevel = defaultEnabledLogs.includes('warn');
    const defaultEnabledErrorLevel = defaultEnabledLogs.includes('error');
    const defaultEnabledFatalLevel = defaultEnabledLogs.includes('fatal');
    const defaultEnabledDebugLevel = defaultEnabledLogs.includes('debug');
    const defaultEnabledDebugSocketLevel = defaultEnabledLogs.includes('debug_packet');

    const logger = new Logger(
      enabledLevels === 'all'
        ? {
            info: defaultEnabledInfoLevel,
            promise: defaultEnabledPromiseLevel,
            success: defaultEnabledSuccessLevel,
            warn: defaultEnabledWarnLevel,
            error: defaultEnabledErrorLevel,
            fatal: defaultEnabledFatalLevel,
            debug: defaultEnabledDebugLevel,
            debug_packet: defaultEnabledDebugSocketLevel,
          }
        : {
            info: enabledLevels?.info === undefined ? defaultEnabledInfoLevel : enabledLevels.info,
            promise:
              enabledLevels?.promise === undefined
                ? defaultEnabledPromiseLevel
                : enabledLevels.promise,
            success:
              enabledLevels?.success === undefined
                ? defaultEnabledSuccessLevel
                : enabledLevels.success,
            warn: enabledLevels?.warn === undefined ? defaultEnabledWarnLevel : enabledLevels.warn,
            error:
              enabledLevels?.error === undefined ? defaultEnabledErrorLevel : enabledLevels.error,
            fatal:
              enabledLevels?.fatal === undefined ? defaultEnabledFatalLevel : enabledLevels.fatal,
            debug:
              enabledLevels?.debug === undefined ? defaultEnabledDebugLevel : enabledLevels.debug,
            debug_packet:
              enabledLevels?.debug_packet === undefined
                ? defaultEnabledDebugSocketLevel
                : enabledLevels.debug_packet,
          },
      defaultConfigMerged,
    );
    contexts.forEach((context) => logger.start(context));

    return logger;
  }
}

const log = Logger.init();

export { log, Logger };
