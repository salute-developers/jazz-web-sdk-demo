import {
  getLocalDevices,
  JazzRoom,
  JazzSdk,
  MediaType,
} from '@salutejs/jazz-sdk-web';
import { getVideoEffectsService } from '@salutejs/jazz-sdk-web-plugins';
import { createScope } from 'nrgy';
import { Controller } from 'nrgy/mvc';

export type MediaManager = {
  setSdk: (sdk: JazzSdk | undefined) => void;
  mute: (
    room: JazzRoom,
    mediaType: MediaType,
    isMuted: boolean,
  ) => Promise<void>;
};

export type MediaManagerController = Controller<MediaManager>;

export const createMediaManager = (): MediaManagerController => {
  const scope = createScope();
  const state = new Map<MediaStream, () => void>();

  let sdk: JazzSdk | undefined;

  const setSdk = (value: JazzSdk | undefined) => {
    sdk = value;
  };

  const mute = async (
    room: JazzRoom,
    mediaType: MediaType,
    isMuted: boolean,
  ): Promise<void> => {
    if (!sdk) {
      return;
    }
    if (room.status() !== 'connected' && room.status() !== 'connecting') {
      return;
    }

    let roomStream: MediaStream | undefined;

    if (mediaType === 'audio') {
      roomStream = room.userAudioStream();
    } else if (mediaType === 'video') {
      roomStream = room.userVideoStream();
    } else if (mediaType === 'displayScreen') {
      roomStream = room.displayStream();
    }

    if (roomStream) {
      if (mediaType === 'audio') {
        await room.muteAudioInput(isMuted);
      } else if (mediaType === 'video') {
        await room.muteVideoInput(isMuted);
      } else if (mediaType === 'displayScreen') {
        room.setDisplayVideoInput(undefined);
      }
      return;
    }

    const ld = getLocalDevices(sdk);
    const videoEffectService = getVideoEffectsService(sdk);

    let stream: MediaStream | undefined;
    try {
      if (mediaType === 'audio') {
        stream = await ld.getSelectedAudioInputStream({ isMuted });
      } else if (mediaType === 'video') {
        stream = await ld.getSelectedVideoInputStream({ isMuted });
      } else if (mediaType === 'displayScreen') {
        stream = await ld.getDisplayInputStream();
      }
    } catch (error) {
      console.log(`Media permission for ${mediaType} is denied`);
      throw error;
    }

    if (!stream) {
      return;
    }

    if (mediaType === 'audio') {
      room.setUserAudioInput(stream);
    } else if (mediaType === 'video') {
      room.setUserVideoInput(stream);
      videoEffectService.setMediaStream(stream);
    } else if (mediaType === 'displayScreen') {
      room.setDisplayVideoInput(stream);
    }

    const destroy = () => {
      if (!sdk) {
        return;
      }
      state.delete(stream);
      room.off('destroy', destroy);
      console.log(`Release ${mediaType} mediaStream`);
      getLocalDevices(sdk).releaseMediaStream(stream);
    };

    room.once('destroy', destroy);

    state.set(stream, destroy);
  };

  scope.onDestroy(() => {
    state.forEach((destroy) => {
      destroy();
    });
  });

  return {
    setSdk,
    mute,
    destroy: scope.destroy,
  };
};
