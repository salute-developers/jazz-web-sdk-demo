import { FC, useEffect, useState } from 'react';

import {
  createJazzWebSdk,
  JazzSdk,
  JazzSdkPlugin,
  SDK_VERSION,
} from '@salutejs/jazz-sdk-web';
import {
  audioOutputMixerPlugin,
  logsPlugin,
  videoElementPoolPlugin,
} from '@salutejs/jazz-sdk-web-plugins';
import {
  BodyM,
  ModalsProvider,
  NotificationsProvider,
} from '@salutejs/plasma-b2c';
import { surfaceSolid02, tertiary } from '@salutejs/plasma-tokens';
import styled from 'styled-components/macro';

import { ErrorModal } from './features/error-modal';
import { Lobby } from './features/lobby';
import { GlobalStyles } from './shared/components/GlobalStyle';
import { AudioGainSettings } from './shared/containers/AudioSettings';
import { MediaSettings } from './shared/containers/MediaSettings';
import { ClientsContextProvider } from './shared/contexts/clientsContext';
import {
  GlobalContextProvider,
  useGlobalContext,
} from './shared/contexts/globalContext';
import { useDeviceSync } from './shared/hooks/useDeviceSync';
import { ClientCardListWidget } from './widgets/ClientCardListWidget';

type InitSDKStatus = 'fail' | 'success' | 'process';

const Root = styled.div`
  display: grid;
  gap: 24px;
`;

const SDKInfo = styled.div`
  width: 100%;
  background: ${surfaceSolid02};
  padding: 4px;
  box-sizing: border-box;
  border-bottom: 1px solid ${tertiary};
`;

const SDKInfoText = styled(BodyM)`
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const RootContent = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  padding: 0px 32px 32px;
`;

const LeftContent = styled.div`
  width: 100%;
`;

const RightContent = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 570px;
  width: 570px;
`;

const STATUS: Record<InitSDKStatus, string> = {
  fail: '🔴',
  process: '🟠',
  success: '🟢',
};

const App: FC<{
  jazzSdkPlugins: ReadonlyArray<JazzSdkPlugin>;
  DesktopCapturerComponent?: FC<{ jazzSdk: JazzSdk }>;
}> = (props) => {
  const { jazzSdkPlugins, DesktopCapturerComponent } = props;
  const { setSdk, eventBus, sdk, devices } = useGlobalContext();

  const [status, setStatus] = useState<InitSDKStatus>('process');

  useEffect(() => {
    let jazzSdk: JazzSdk | undefined;
    let isDestroyed = false;
    // create sdk
    createJazzWebSdk({
      userAgent: 'Jazz Test App',
      plugins: [
        ...jazzSdkPlugins,
        videoElementPoolPlugin(),
        audioOutputMixerPlugin(),
        logsPlugin({
          logLevel: 'debug',
          isEnableStdout: true,
        }),
      ],
      audioInputDeviceId: devices.getAudioInput(),
      audioOutputDeviceId: devices.getAudioOutput(),
      videoInputDeviceId: devices.getVideoInput(),
    })
      .then((sdk) => {
        if (isDestroyed) {
          sdk.destroy();
          return;
        }
        jazzSdk = sdk;
        setSdk(sdk);
        setStatus('success');
      })
      .catch((error) => {
        if (isDestroyed) {
          return;
        }
        console.error('Fail create sdk', error);
        setStatus('fail');
        eventBus({ type: 'error', payload: { title: 'fail create sdk' } });
      });

    return () => {
      setSdk(undefined);
      jazzSdk?.destroy();
      isDestroyed = true;
    };
  }, [setSdk, eventBus, devices, jazzSdkPlugins]);

  return (
    <Root>
      <SDKInfo>
        <SDKInfoText>SDK version: {SDK_VERSION}</SDKInfoText>
        <SDKInfoText>SDK status: {STATUS[status]}</SDKInfoText>
      </SDKInfo>
      {sdk && <Content />}
      <ErrorModal />
      {DesktopCapturerComponent && sdk ? (
        <DesktopCapturerComponent jazzSdk={sdk} />
      ) : null}
    </Root>
  );
};

const Content: FC = () => {
  useDeviceSync();

  return (
    <RootContent>
      <LeftContent>
        <ClientCardListWidget />
      </LeftContent>
      <RightContent>
        <Lobby />
        <AudioGainSettings />
        <MediaSettings />
      </RightContent>
    </RootContent>
  );
};

export const AppContainer: FC<{
  jazzSdkPlugins?: ReadonlyArray<JazzSdkPlugin> | undefined;
  DesktopCapturerComponent?: FC<{ jazzSdk: JazzSdk }>;
}> = ({ DesktopCapturerComponent, jazzSdkPlugins = [] }) => {
  return (
    <GlobalContextProvider>
      <ClientsContextProvider>
        <ModalsProvider>
          <NotificationsProvider>
            <GlobalStyles />
            <App
              jazzSdkPlugins={jazzSdkPlugins}
              DesktopCapturerComponent={DesktopCapturerComponent}
            />
          </NotificationsProvider>
        </ModalsProvider>
      </ClientsContextProvider>
    </GlobalContextProvider>
  );
};
