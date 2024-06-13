import path from 'node:path';
import url from 'node:url';

import { Logger } from '../logger';

export type FileSystemService = {
  resolveFileUrl: (
    filePath: string,
    options?: Partial<{
      hash: string;
      query: Record<string, string>;
    }>,
  ) => string;
};

export const fileSystemModule = (props: {
  logger: Logger;
  // process.env.ELECTRON_START_URL
  electronStartUrl?: string;
}): FileSystemService => {
  const { logger, electronStartUrl } = props;

  function resolveFileUrl(
    filePath: string,
    options: Partial<{ hash: string; query: Record<string, string> }> = {},
  ): string {
    const { hash, query = {} } = options;
    if (electronStartUrl) {
      return url.format({
        pathname: `${electronStartUrl}/${filePath}`,
        hash,
        query,
      });
    }

    const fileUrl = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, `../${filePath}`),
      slashes: true,
      hash,
      query,
    });
    logger.debug(`Resolved as file url: ${filePath} => ${fileUrl}`);

    return fileUrl;
  }

  return {
    resolveFileUrl,
  };
};
