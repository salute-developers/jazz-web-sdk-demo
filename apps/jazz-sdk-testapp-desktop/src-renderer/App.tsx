import React from 'react';

import { desktopCapturerPlugin } from '@salutejs/jazz-sdk-electron-plugins/renderer';
import { AppContainer } from 'jazz-sdk-testapp-universal/src';
import ReactDOM from 'react-dom/client';

import { DesktopCapturer } from './containers/desktopCapturer';

export const startApp = async (): Promise<void> => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
  );

  root.render(
    <AppContainer
      jazzSdkPlugins={[desktopCapturerPlugin()]}
      DesktopCapturerComponent={DesktopCapturer}
    />,
  );
};
