import { FC, useEffect, useState } from 'react';

import { createJazzWebSdk, SDK_VERSION } from '@salutejs/jazz-sdk-web';
import {
  audioOutputMixerPlugin,
  logsPlugin,
  videoElementPoolPlugin,
} from '@salutejs/jazz-sdk-web-plugins';
import { BodyM, ModalsProvider } from '@salutejs/plasma-b2c';
import { surfaceSolid02, tertiary } from '@salutejs/plasma-tokens-b2c/colors';
import styled from 'styled-components/macro';

import { ErrorModal } from './features/error-modal';
import { Lobby } from './features/lobby';
import { GlobalStyles } from './shared/components/GlobalStyle';
import { AudioGainSettings } from './shared/containers/AudioSettings';
import { MediaSettings } from './shared/containers/MediaSettings';
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

const ContentWrapper = styled.div`
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
`;

const App: FC = () => {
  const { setSdk, eventBus } = useGlobalContext();

  const [status, setStatus] = useState<InitSDKStatus>('process');

  const { audioInputDeviceId, audioOutputDeviceId, videoInputDeviceId } =
    useDeviceSync();

  useEffect(() => {
    console.log('Start creating sdk...');
    // create sdk
    createJazzWebSdk({
      userAgent: 'Jazz Test App',
      plugins: [
        videoElementPoolPlugin(),
        audioOutputMixerPlugin(),
        logsPlugin({
          logLevel: 'debug',
        }),
      ],
      audioInputDeviceId,
      audioOutputDeviceId,
      videoInputDeviceId,
    })
      .then(async (sdk) => {
        console.log('Sdk is created');
        setSdk(sdk);
        setStatus('success');
      })
      .catch((error) => {
        console.error('Fail create sdk', error);
        setStatus('fail');
        eventBus({ type: 'error', payload: { title: 'fail create sdk' } });
      });
  }, [
    setSdk,
    eventBus,
    audioInputDeviceId,
    audioOutputDeviceId,
    videoInputDeviceId,
  ]);

  return (
    <Root>
      <SDKInfo>
        <SDKInfoText>SDK version: {SDK_VERSION}</SDKInfoText>
        <SDKInfoText>Init SDK status: {status}</SDKInfoText>
      </SDKInfo>
      {status === 'success' && (
        <ContentWrapper>
          <LeftContent>
            <ClientCardListWidget />
          </LeftContent>
          <RightContent>
            <Lobby />
            <AudioGainSettings />
            <MediaSettings />
          </RightContent>
        </ContentWrapper>
      )}

      <ErrorModal />
    </Root>
  );
};

export const AppContainer: FC = () => {
  return (
    <GlobalContextProvider>
      <ModalsProvider>
        <GlobalStyles />
        <App />
      </ModalsProvider>
    </GlobalContextProvider>
  );
};
