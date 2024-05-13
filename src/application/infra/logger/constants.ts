import { Logger } from '.';

export const loggers = Object.freeze({
  server: Logger.init('SERVER'),
} as const);
