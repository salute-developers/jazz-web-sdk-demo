import { FC } from 'react';

import { getDesktopCapturer } from '@salutejs/jazz-sdk-electron-plugins/renderer';
import { JazzSdk } from '@salutejs/jazz-sdk-web';

import { ScreenSharePicker } from './ScreenSharePicker';
export const DesktopCapturer: FC<{ jazzSdk: JazzSdk }> = ({ jazzSdk }) => {
  const desktopCapturer = getDesktopCapturer(jazzSdk);

  return <ScreenSharePicker desktopCapturer={desktopCapturer} />;
};
