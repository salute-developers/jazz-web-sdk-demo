import { BrowserWindow, screen, shell } from 'electron';
import windowStateKeeper from 'electron-window-state';
import path from 'path';

import { FileSystemService } from '../fileSystem';
import { Logger } from '../logger';

// It must be the same as a background color of the web app.
const WINDOW_BACKGROUND_COLOR = '#080808';

export type MainWidnowController = {
  createMainWindow: (props: { title: string }) => Promise<BrowserWindow>;
};

export const createMainWindowController = (props: {
  isDevMode: boolean;
  devUrl: string;
  logger: Logger;
  fileSystem: FileSystemService;
}): MainWidnowController => {
  const { logger, devUrl, isDevMode, fileSystem } = props;

  const createMainWindow = async (props: {
    title: string;
  }): Promise<BrowserWindow> => {
    const { title } = props;

    const primaryDisplay = screen.getPrimaryDisplay();

    const mainWindowState = windowStateKeeper({
      defaultWidth: primaryDisplay.workArea.width ?? 1024,
      defaultHeight: primaryDisplay.workArea.height ?? 750,
    });

    const { minWidth, minHeight } = getMinBoundaryOfDesktopView();

    const mainWindow = new BrowserWindow({
      title,
      x: mainWindowState.x ?? primaryDisplay.workArea.x,
      y: mainWindowState.y ?? primaryDisplay.workArea.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth,
      minHeight,
      backgroundColor: WINDOW_BACKGROUND_COLOR,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        enableBlinkFeatures: 'WebAssemblySimd',
        contextIsolation: true,
        nodeIntegration: true,
        webSecurity: !isDevMode,
      },
    });

    if (isDevMode) {
      mainWindow.webContents.openDevTools();
    }

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details?.url);
      return { action: 'deny' };
    });

    const prodUrl = fileSystem.resolveFileUrl('index.html');

    const startUrl = isDevMode ? devUrl : prodUrl;

    mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
      logger.error('Fail main preload', error);
    });

    logger.debug('opening startUrl:', startUrl);
    mainWindow.loadURL(startUrl);

    return mainWindow;
  };

  return {
    createMainWindow,
  };
};

const getMinBoundaryOfDesktopView = (): {
  minWidth: number;
  minHeight: number;
} => {
  const heightElectronToolbars = 28;
  const minBreakpointWidth = 769;
  const minBreakpointHeight = 600 + heightElectronToolbars;

  return { minWidth: minBreakpointWidth, minHeight: minBreakpointHeight };
};
