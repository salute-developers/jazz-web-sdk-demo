import { createJazzSdkElectronMain } from '@salutejs/jazz-sdk-electron/main';
import {
  desktopCapturerPlugin,
  logsPlugin,
} from '@salutejs/jazz-sdk-electron-plugins/main';
import { app, BrowserWindow } from 'electron';

import { fileSystemModule } from './modules/fileSystem';
import { createLogger } from './modules/logger';
import { windowsModule } from './modules/windows';
import { createErrorHandler } from './utils/errorHandler';
import { isDevMode as isDevModeCheck } from './utils/isDevMode';
import { parseUrl } from './utils/parseUrl';
import { showWindow } from './utils/showWindow';

const devUrl = 'http://localhost:3000';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | undefined;

export const main = async (): Promise<void> => {
  const isDevMode = isDevModeCheck();

  const logger = createLogger({ level: isDevMode ? 'debug' : 'error' });
  const title = 'Test App';

  const fileSystem = fileSystemModule({
    logger,
    electronStartUrl: process.env.ELECTRON_START_URL,
  });

  const windows = windowsModule({
    devUrl,
    fileSystem,
    isDevMode,
    logger,
  });

  const errorHandler = createErrorHandler(logger);
  process.on('uncaughtException', errorHandler);
  process.on('unhandledRejection', errorHandler);

  app.on('activate', async () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!mainWindow || mainWindow?.isDestroyed()) {
      mainWindow = await windows.createMainWindow({
        title,
      });
    }
    // Force show - screen sharing windows can intercept focus on dock click.
    if (mainWindow) {
      showWindow(mainWindow);
    }
  });

  app.on(
    'certificate-error',
    (event, webContents, url, error, certificate, callback) => {
      const urlData = parseUrl(url);

      const isDevSite = isDevMode && urlData?.hostname === 'localhost';

      const isCertTrusted = isDevSite;

      if (isCertTrusted) {
        logger.debug(`Accepted SSL certificate as trusted: ${url}`);
        event.preventDefault();
        callback(true);
      } else {
        logger.warn(`Certificate error: ${url}`);
        callback(false);
      }
    },
  );

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  await app.whenReady();

  await createJazzSdkElectronMain({
    plugins: [
      logsPlugin({
        logLevel: 'debug',
        subscribe: (value) => {
          logger[value.level](`[${value.tag}] ${value.messages.join(' ')}`);
        },
      }),
      desktopCapturerPlugin(),
    ],
  });

  mainWindow = await windows.createMainWindow({
    title,
  });
};
