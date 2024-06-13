import { createJazzSdkElectronPreload } from '@salutejs/jazz-sdk-electron/preload';
import { desktopCapturerPlugin } from '@salutejs/jazz-sdk-electron-plugins/preload';

createJazzSdkElectronPreload({ plugins: [desktopCapturerPlugin()] });
