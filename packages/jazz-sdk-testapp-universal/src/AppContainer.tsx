import { FC, useEffect, useState } from 'react';

import {
  createJazzSdkWeb,
  JazzSdk,
  JazzSdkPlugin,
  SDK_VERSION,
} from '@salutejs/jazz-sdk-web';
import {
  audioOutputMixerPlugin,
  logsPlugin,
  videoEffectsPlugin,
  videoElementPoolPlugin,
} from '@salutejs/jazz-sdk-web-plugins';
import {
  BodyM,
  ModalsProvider,
  NotificationsProvider,
  PopupBaseProvider,
} from '@salutejs/plasma-b2c';
import {
  surfaceSolidSecondary as surfaceSolid02,
  textTertiary as tertiary,
} from '@salutejs/plasma-themes/tokens';
import styled from 'styled-components/macro';

import { ErrorModal } from './features/error-modal';
import { Lobby } from './features/lobby';
import { VirtualBackgrounds } from './features/virtual-backgrounds';
import { GlobalStyles } from './shared/components/GlobalStyle';
import { AudioGainSettings } from './shared/containers/AudioSettings';
import { MediaSettings } from './shared/containers/MediaSettings';
import { ClientsContextProvider } from './shared/contexts/clientsContext';
import {
  GlobalContextProvider,
  useGlobalContext,
} from './shared/contexts/globalContext';
import { SDKContextProvider } from './shared/contexts/sdkContext';
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
  createJazzSdk: typeof createJazzSdkWeb;
  jazzSdkPlugins: ReadonlyArray<JazzSdkPlugin>;
  DesktopCapturerComponent?: FC<{ jazzSdk: JazzSdk }>;
  AdditionalVersionsComponent?: FC<{ jazzSdk: JazzSdk; InfoTextComponent: FC }>;
}> = (props) => {
  const {
    jazzSdkPlugins,
    DesktopCapturerComponent,
    createJazzSdk,
    AdditionalVersionsComponent,
  } = props;
  const { eventBus, devices } = useGlobalContext();
  const [sdk, setSdk] = useState<JazzSdk | undefined>();

  const [status, setStatus] = useState<InitSDKStatus>('process');

  useEffect(() => {
    let jazzSdk: JazzSdk | undefined;
    let isDestroyed = false;
    // create sdk
    createJazzSdk({
      clientName: 'JazzTestApp',
      plugins: [
        ...jazzSdkPlugins,
        videoElementPoolPlugin(),
        audioOutputMixerPlugin(),
        logsPlugin({
          logLevel: 'debug',
          isEnableStdout: true,
        }),
        videoEffectsPlugin(),
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
  }, [setSdk, eventBus, devices, jazzSdkPlugins, createJazzSdk]);

  return (
    <Root>
      <SDKInfo>
        <SDKInfoText>SDK version: {SDK_VERSION}</SDKInfoText>
        <SDKInfoText>SDK status: {STATUS[status]}</SDKInfoText>
        {AdditionalVersionsComponent && sdk ? (
          <AdditionalVersionsComponent
            jazzSdk={sdk}
            InfoTextComponent={SDKInfoText}
          />
        ) : null}
      </SDKInfo>
      {sdk && (
        <SDKContextProvider sdk={sdk}>
          <Content sdk={sdk} />
          <ErrorModal />
          {DesktopCapturerComponent ? (
            <DesktopCapturerComponent jazzSdk={sdk} />
          ) : null}
        </SDKContextProvider>
      )}
    </Root>
  );
};

const Content: FC<{ sdk: JazzSdk }> = ({ sdk }) => {
  useDeviceSync({ sdk });

  return (
    <RootContent>
      <LeftContent>
        <ClientCardListWidget />
      </LeftContent>
      <RightContent>
        <Lobby />
        <AudioGainSettings />
        <VirtualBackgrounds />
        <MediaSettings />
      </RightContent>
    </RootContent>
  );
};

export const AppContainer: FC<{
  createJazzSdk: typeof createJazzSdkWeb;
  jazzSdkPlugins?: ReadonlyArray<JazzSdkPlugin> | undefined;
  DesktopCapturerComponent?: FC<{ jazzSdk: JazzSdk }>;
  AdditionalVersionsComponent?: FC<{ jazzSdk: JazzSdk; InfoTextComponent: FC }>;
}> = ({
  DesktopCapturerComponent,
  jazzSdkPlugins = [],
  createJazzSdk,
  AdditionalVersionsComponent,
}) => {
  return (
    <GlobalContextProvider>
      <ClientsContextProvider>
        <PopupBaseProvider>
          <ModalsProvider>
            <NotificationsProvider>
              <GlobalStyles />
              <App
                createJazzSdk={createJazzSdk}
                jazzSdkPlugins={jazzSdkPlugins}
                DesktopCapturerComponent={DesktopCapturerComponent}
                AdditionalVersionsComponent={AdditionalVersionsComponent}
              />
            </NotificationsProvider>
          </ModalsProvider>
        </PopupBaseProvider>
      </ClientsContextProvider>
    </GlobalContextProvider>
  );
};
