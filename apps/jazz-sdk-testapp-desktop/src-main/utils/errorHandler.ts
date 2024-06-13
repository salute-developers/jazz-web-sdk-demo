import { Logger } from '../modules/logger';

export function createErrorHandler(logger: Logger): (error: Error) => void {
  return (error: Error) => {
    try {
      logger.error(error);
    } catch {
      console.error(error);
    }
  };
}
