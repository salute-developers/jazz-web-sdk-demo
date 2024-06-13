import type { Logger, LogLevel } from 'electron-log';
import logger from 'electron-log';
export type { LogLevel, Logger };
type LoggerConfig = {
  readonly level?: LogLevel;
};
const MAX_LOG_FILE_SIZE_IN_KB = 10 * 1024 * 1024;
export function createLogger({ level = 'info' }: LoggerConfig): Logger {
  Object.assign(logger.transports.file, {
    level,
    maxSize: MAX_LOG_FILE_SIZE_IN_KB,
  });
  Object.assign(logger.transports.console, {
    level,
  });
  return logger;
}
