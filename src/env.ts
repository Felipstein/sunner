/* eslint-disable no-console */

import 'dotenv/config';

import chalk from 'chalk';
import z, { ZodError } from 'zod';

import { Logger } from '@infra/logger';
import { Level } from '@infra/logger/levels';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),

  HOSTNAME: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().default(25565),

  LOGS: z
    .string({ required_error: 'Required, e.g: "info", "info,warn", etc...' })
    .transform((logs) => logs.split(',') as Level['level'][]),
});

try {
  const envParsed = envSchema.parse(process.env);

  // @ts-expect-error
  process.env = {
    ...process.env,
    ...envParsed,
  };

  if (envParsed.NODE_ENV !== 'test') {
    console.info('Environment variables loaded');

    if (envParsed.LOGS.includes('debug') || envParsed.LOGS.includes('debug_packet')) {
      const log = Logger.init();
      log.debug(chalk.magenta('Debug mode enabled'));
      log.debugPacket(chalk.magenta('Debug Packet Traffic mode enabled'));
    }
  }
} catch (error: unknown) {
  if (error instanceof ZodError) {
    console.error(chalk.rgb(255, 0, 0).bold('Invalid environment variables:'));

    error.issues.forEach((issue) => {
      console.error(
        chalk.gray('-'),
        `${chalk.bold(issue.path.join('.'))}:`,
        chalk.red(issue.message),
      );
    });

    process.exit(1);
  }

  throw error;
}

declare global {
  namespace NodeJS {
    // @ts-ignore
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
