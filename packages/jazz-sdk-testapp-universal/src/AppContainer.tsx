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
  BodyS,
  ModalsProvider,
  NotificationsProvider,
  PopupBaseProvider,
  ToastProvider,
} from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { ErrorModal } from './features/error-modal';
import { Lobby } from './features/lobby';
import { VirtualBackgrounds } from './features/virtual-backgrounds';
import { GlobalStyles } from './shared/components/GlobalStyle';
import { Logo } from './shared/components/Logo/Logo';
import { AudioGainSettings } from './shared/containers/AudioSettings';
import { MediaSettings } from './shared/containers/MediaSettings';
import { SlotArea } from './shared/containers/SlotArea';
import { ClientsContextProvider } from './shared/contexts/clientsContext';
import {
  GlobalContextProvider,
  useGlobalContext,
} from './shared/contexts/globalContext';
import { SDKContextProvider } from './shared/contexts/sdkContext';
import { useDeviceSync } from './shared/hooks/useDeviceSync';
import { Plugin } from './shared/types/plugins';
import { ClientCardListWidget } from './widgets/ClientCardListWidget';

const Root = styled.div`
  display: grid;
  gap: 24px;
`;

const Header = styled.div`
  margin: 0 32px;
  padding: 16px 0 0;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  gap: 8px;
`;

const SDKInfoText = styled(BodyS)`
  color: #7683a4;
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

const App: FC<{
  createJazzSdk: typeof createJazzSdkWeb;
  jazzSdkPlugins: ReadonlyArray<JazzSdkPlugin> | undefined;
  DesktopCapturerComponent?: FC<{ jazzSdk: JazzSdk }>;
  AdditionalVersionsComponent?: FC<{ jazzSdk: JazzSdk; InfoTextComponent: FC }>;
}> = (props) => {
  const {
    jazzSdkPlugins,
    DesktopCapturerComponent,
    createJazzSdk,
    AdditionalVersionsComponent,
  } = props;
  const { eventBus, devices, mediaManager } = useGlobalContext();
  const [sdk, setSdk] = useState<JazzSdk | undefined>();

  useEffect(() => {
    let jazzSdk: JazzSdk | undefined;
    let isDestroyed = false;
    // create sdk
    createJazzSdk({
      clientName: 'JazzTestApp',
      configFlags: {
        'vcsSdk.canCreateAnonymousRoom': 'true',
      },
      plugins: [
        ...(jazzSdkPlugins || []),
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
        mediaManager.setSdk(sdk);
      })
      .catch((error) => {
        if (isDestroyed) {
          return;
        }
        console.error('Fail create sdk', error);
        eventBus({ type: 'error', payload: { title: 'fail create sdk' } });
      });

    return () => {
      setSdk(undefined);
      mediaManager.setSdk(undefined);
      jazzSdk?.destroy();
      isDestroyed = true;
    };
  }, [setSdk, eventBus, devices, jazzSdkPlugins, createJazzSdk, mediaManager]);

  return (
    <Root>
      <Header>
        <Logo logoText="JazzSDK" subText={SDK_VERSION} />
        {AdditionalVersionsComponent && sdk ? (
          <AdditionalVersionsComponent
            jazzSdk={sdk}
            InfoTextComponent={SDKInfoText}
          />
        ) : null}
      </Header>

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
        <SlotArea slotName="UtilityPanel" />
      </RightContent>
    </RootContent>
  );
};

export const AppContainer: FC<{
  createJazzSdk: typeof createJazzSdkWeb;
  appPlugins?: Plugin[];
  jazzSdkPlugins?: ReadonlyArray<JazzSdkPlugin> | undefined;
  DesktopCapturerComponent?: FC<{ jazzSdk: JazzSdk }>;
  AdditionalVersionsComponent?: FC<{ jazzSdk: JazzSdk; InfoTextComponent: FC }>;
}> = ({
  DesktopCapturerComponent,
  jazzSdkPlugins,
  createJazzSdk,
  AdditionalVersionsComponent,
  appPlugins,
}) => {
  return (
    <GlobalContextProvider plugins={appPlugins}>
      <ClientsContextProvider>
        <ToastProvider>
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
        </ToastProvider>
      </ClientsContextProvider>
    </GlobalContextProvider>
  );
};
