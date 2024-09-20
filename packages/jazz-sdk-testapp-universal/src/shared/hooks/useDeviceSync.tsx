import { useEffect } from 'react';

import {
  getLocalDevices,
  handleEvent,
  LOCAL_MEDIA_DEVICE_KIND,
  LocalMediaDevice,
} from '@salutejs/jazz-sdk-web';
import {
  addNotification,
  Button,
  closeNotification,
} from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { useGlobalContext } from '../contexts/globalContext';

export const useDeviceSync = (): void => {
  const { sdk, devices } = useGlobalContext();

  useEffect(() => {
    if (!sdk) {
      return;
    }

    const localDevices = getLocalDevices(sdk);

    const unsubscribeDevicesChanged = handleEvent(
      localDevices.event$,
      'mediaDevicesChanged',
      ({ payload: { added } }) => {
        added.forEach((addedItem) => {
          if (addedItem.kind === LOCAL_MEDIA_DEVICE_KIND.AUDIO_INPUT) {
            const notificationId = addNotification(
              {
                title: 'New device',
                children: (
                  <MediaNotification
                    type="microphone"
                    addedItem={addedItem}
                    onApply={() => {
                      localDevices.selectAudioInput(addedItem);
                      closeNotification(notificationId);
                    }}
                    onCancel={() => {
                      closeNotification(notificationId);
                    }}
                  />
                ),
              },
              45000,
            );
          }
          if (addedItem.kind === LOCAL_MEDIA_DEVICE_KIND.AUDIO_OUTPUT) {
            const notificationId = addNotification(
              {
                title: 'New device',
                children: (
                  <MediaNotification
                    type="speakers"
                    addedItem={addedItem}
                    onApply={() => {
                      localDevices.selectAudioOutput(addedItem);
                      closeNotification(notificationId);
                    }}
                    onCancel={() => {
                      closeNotification(notificationId);
                    }}
                  />
                ),
              },
              45000,
            );
          }
          if (addedItem.kind === LOCAL_MEDIA_DEVICE_KIND.VIDEO_INPUT) {
            const notificationId = addNotification(
              {
                title: 'New device',
                children: (
                  <MediaNotification
                    type="camera"
                    addedItem={addedItem}
                    onApply={() => {
                      localDevices.selectVideoInput(addedItem);
                      closeNotification(notificationId);
                    }}
                    onCancel={() => {
                      closeNotification(notificationId);
                    }}
                  />
                ),
              },
              45000,
            );
          }
        });
      },
    );

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
      unsubscribeDevicesChanged();
      unsubscribeAudioInput();
      unsubscribeAudioOutput();
      unsubscribeVideoInput();
    };
  }, [sdk, devices]);
};

export const NotificationRoot = styled.div`
  display: grid;
  gap: 8px;
`;

export const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const MediaNotification: React.FC<{
  addedItem: LocalMediaDevice;
  type: 'camera' | 'microphone' | 'speakers';
  onApply: () => void;
  onCancel: () => void;
}> = ({ addedItem, onApply, onCancel, type }) => {
  return (
    <NotificationRoot>
      A new {type === 'speakers' ? 'speakers have' : `${type} has`} been
      connected: {addedItem.label}{' '}
      <Container>
        <Button view="primary" onClick={onApply}>
          Use
        </Button>
        <Button view="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </Container>
    </NotificationRoot>
  );
};
