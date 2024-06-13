import { FileSystemService } from '../fileSystem';
import { Logger } from '../logger';

import {
  createMainWindowController,
  MainWidnowController,
} from './mainWindowController';

export type WindowsService = {
  createMainWindow: MainWidnowController['createMainWindow'];
};

export const windowsModule = (props: {
  logger: Logger;
  fileSystem: FileSystemService;
  isDevMode: boolean;
  devUrl: string;
}): WindowsService => {
  const { logger, fileSystem, isDevMode, devUrl } = props;
  const mainWindow = createMainWindowController({
    devUrl,
    fileSystem,
    isDevMode,
    logger,
  });

  return {
    createMainWindow: mainWindow.createMainWindow,
  };
};
