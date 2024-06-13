import { desktopCapturerPlugin } from '@salutejs/jazz-sdk-electron-plugins/renderer';
import ReactDOM from 'react-dom';

import { AppContainer } from 'jazz-sdk-testapp-universal/src';

import { DesktopCapturer } from './containers/desktopCapturer';

export const startApp = async (): Promise<void> => {
  const root = document.getElementById('root');

  ReactDOM.render(
    <AppContainer
      jazzSdkPlugins={[desktopCapturerPlugin()]}
      DesktopCapturerComponent={DesktopCapturer}
    />,
    root,
  );
};
