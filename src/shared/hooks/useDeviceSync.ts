import { useEffect, useState } from 'react';

import { getLocalDevices, handleEvent } from '@salutejs/jazz-sdk-web';

import { useGlobalContext } from '../contexts/globalContext';
import { createDevicesStorage } from '../utils/mediaSettingsStorage';

const deviceStorage = createDevicesStorage();

export const useDeviceSync = (): {
  audioInputDeviceId: string | undefined;
  audioOutputDeviceId: string | undefined;
  videoInputDeviceId: string | undefined;
} => {
  const { sdk } = useGlobalContext();

  const [state] = useState<{
    audioInputDeviceId: string | undefined;
    audioOutputDeviceId: string | undefined;
    videoInputDeviceId: string | undefined;
  }>(() => {
    return {
      audioInputDeviceId: deviceStorage.getAudioInput(),
      audioOutputDeviceId: deviceStorage.getAudioOutput(),
      videoInputDeviceId: deviceStorage.getVideoInput(),
    };
  });
  useEffect(() => {
    if (!sdk) {
      return;
    }

    const localDevices = getLocalDevices(sdk);

    const unsubscribeAudioInput = handleEvent(
      localDevices.event$,
      'audioInputChanged',
      ({ payload: { device } }) => {
        deviceStorage.setAudioInput(device.deviceId);
      },
    );
    const unsubscribeAudioOutput = handleEvent(
      localDevices.event$,
      'audioOutputChanged',
      ({ payload: { device } }) => {
        deviceStorage.setAudioOutput(device.deviceId);
      },
    );
    const unsubscribeVideoInput = handleEvent(
      localDevices.event$,
      'videoInputChanged',
      ({ payload: { device } }) => {
        deviceStorage.setVideoInput(device.deviceId);
      },
    );

    return () => {
      unsubscribeAudioInput();
      unsubscribeAudioOutput();
      unsubscribeVideoInput();
    };
  }, [sdk]);

  return state;
};
