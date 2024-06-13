import {
  LocalMediaDeviceId,
  LocalMediaDeviceKind,
} from '@salutejs/jazz-sdk-web';

import {
  DEVICES_AUDIOINPUT_KEY,
  DEVICES_AUDIOOUTPUT_KEY,
  DEVICES_VIDEOINPUT_KEY,
} from '../constants';

export type SelectedDevicesStorage = Record<
  LocalMediaDeviceKind,
  LocalMediaDeviceId | undefined
>;

export type DevicesStorage = Readonly<{
  getAudioInput: () => LocalMediaDeviceId | undefined;
  setAudioInput: (value: LocalMediaDeviceId | undefined) => void;

  getVideoInput: () => LocalMediaDeviceId | undefined;
  setVideoInput: (value: LocalMediaDeviceId | undefined) => void;

  getAudioOutput: () => LocalMediaDeviceId | undefined;
  setAudioOutput: (value: LocalMediaDeviceId | undefined) => void;
}>;

export function createDevicesStorage(): DevicesStorage {
  return {
    getAudioInput: () => localStorage.getItem(DEVICES_AUDIOINPUT_KEY) ?? '',
    setAudioInput: (value) =>
      localStorage.setItem(DEVICES_AUDIOINPUT_KEY, value ?? ''),

    getVideoInput: () => localStorage.getItem(DEVICES_VIDEOINPUT_KEY) ?? '',
    setVideoInput: (value) =>
      localStorage.setItem(DEVICES_VIDEOINPUT_KEY, value ?? ''),

    getAudioOutput: () => localStorage.getItem(DEVICES_AUDIOOUTPUT_KEY) ?? '',
    setAudioOutput: (value) =>
      localStorage.setItem(DEVICES_AUDIOOUTPUT_KEY, value ?? ''),
  };
}
