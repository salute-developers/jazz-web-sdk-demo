import { useEffect } from 'react';

import { getLocalDevices, handleEvent } from '@salutejs/jazz-sdk-web';

import { useGlobalContext } from '../contexts/globalContext';

export const useDeviceSync = (): void => {
  const { sdk, devices } = useGlobalContext();

  useEffect(() => {
    if (!sdk) {
      return;
    }

    const localDevices = getLocalDevices(sdk);

    const unsubscribeAudioInput = handleEvent(
      localDevices.event$,
      'audioInputChanged',
      ({ payload: { device } }) => {
        devices.setAudioInput(device.deviceId);
      },
    );
    const unsubscribeAudioOutput = handleEvent(
      localDevices.event$,
      'audioOutputChanged',
      ({ payload: { device } }) => {
        devices.setAudioOutput(device.deviceId);
      },
    );
    const unsubscribeVideoInput = handleEvent(
      localDevices.event$,
      'videoInputChanged',
      ({ payload: { device } }) => {
        devices.setVideoInput(device.deviceId);
      },
    );

    return () => {
      unsubscribeAudioInput();
      unsubscribeAudioOutput();
      unsubscribeVideoInput();
    };
  }, [sdk, devices]);
};
