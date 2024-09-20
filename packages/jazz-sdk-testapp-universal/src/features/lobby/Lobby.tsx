import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  getLocalDevices,
  handleEvent,
  ScreenShareUserCanceledError,
} from '@salutejs/jazz-sdk-web';
import { getAudioOutputMixer } from '@salutejs/jazz-sdk-web-plugins';
import { Body2, Button } from '@salutejs/plasma-b2c';
import {
  IconCameraVideo,
  IconDevice,
  IconDisplay,
  IconMic,
  IconMicOff,
  IconVideoOff,
} from '@salutejs/plasma-icons';
import { dark01, white } from '@salutejs/plasma-tokens';
import styled from 'styled-components/macro';

import { useGlobalContext } from '../../shared/contexts/globalContext';

const Title = styled(Body2)`
  margin-bottom: 16px;
`;

const Wrapper = styled.div``;

const Actions = styled.div`
  display: flex;
  justify-content: center;

  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;

const WrapperVideo = styled.div`
  width: 560px;
  height: 300px;
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: 16px;
  position: relative;
`;

const VideoMuted = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${dark01};
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${white};
`;

const Video = styled.video<{
  'data-is-invert'?: boolean;
  'data-is-card'?: boolean;
  'data-is-hidden'?: boolean;
}>`
  pointer-events: none;
  height: 100%;
  object-fit: cover;
  width: 100%;
  display: block;
  background: ${dark01};

  &[data-is-invert='true'] {
    transform: scaleX(-1);
  }

  &[data-is-card='true'] {
    position: absolute;
    left: 8px;
    bottom: 8px;
    height: 100px;
    width: 100px;
    border-radius: 16px;
    box-shadow: 4px 4px 8px #00000038;
    z-index: 1;
  }

  &[data-is-hidden='true'] {
    display: none;
  }
`;

const IconWrapper = styled.div`
  margin-right: 4px;
`;

const IconCamera: FC<{ isMuted: boolean }> = ({ isMuted }) => {
  return (
    <IconWrapper>
      {isMuted ? <IconVideoOff /> : <IconCameraVideo />}
    </IconWrapper>
  );
};

const IconAudio: FC<{ isMuted: boolean }> = ({ isMuted }) => {
  return <IconWrapper>{isMuted ? <IconMicOff /> : <IconMic />}</IconWrapper>;
};

const IconDisplayScreen: FC<{ isMuted: boolean }> = ({ isMuted }) => {
  return (
    <IconWrapper>{isMuted ? <IconDisplay /> : <IconDevice />}</IconWrapper>
  );
};

type Status = 'idle' | 'success' | 'error' | 'pending';

export const Lobby: FC = () => {
  const { sdk, eventBus } = useGlobalContext();

  const [videoStream, setVideoStream] = useState<MediaStream | undefined>();
  const [audioStream, setAudioStream] = useState<MediaStream | undefined>();
  const [displayStream, setDisplayStream] = useState<MediaStream | undefined>();

  const [isMutedCamera, setIsMutedCamera] = useState(true);
  const [isMutedAudio, setIsMutedAudio] = useState(true);
  const [isMutedDisplay, setIsMutedDisplay] = useState(true);

  const [cameraStatus, setCameraStatus] = useState<Status>('idle');
  const [audioStatus, setAudioStatus] = useState<Status>('idle');
  const [displayStatus, setDisplayStatus] = useState<Status>('idle');

  const displayVideoElementRef = useRef<HTMLVideoElement>(null);

  const videoElementRef = useRef<HTMLVideoElement>(null);

  const localDevices = useMemo(() => {
    if (!sdk) return undefined;

    return getLocalDevices(sdk);
  }, [sdk]);

  const audioOutputMixer = useMemo(() => {
    if (!sdk) return undefined;

    return getAudioOutputMixer(sdk);
  }, [sdk]);

  const cancelFn = useRef(() => {});
  cancelFn.current = () => {
    if (audioStream) {
      audioOutputMixer?.removeMediaStream(audioStream);
    }
  };

  useEffect(
    () => () => {
      cancelFn.current();
    },
    [cancelFn],
  );

  useEffect(() => {
    if (!videoElementRef.current) return;

    videoElementRef.current.srcObject = videoStream || null;
    videoElementRef.current.load();
    videoElementRef.current.play().catch(() => {});
  }, [videoElementRef, videoStream]);

  useEffect(() => {
    if (!displayVideoElementRef.current) return;

    const activeStream = !isMutedDisplay ? displayStream : null;

    displayVideoElementRef.current.srcObject = activeStream || null;
    displayVideoElementRef.current.load();
    displayVideoElementRef.current.play().catch(() => {});
  }, [displayVideoElementRef, displayStream, isMutedDisplay]);

  useEffect(() => {
    if (!localDevices) return;

    const unsubscribeMuteChange = handleEvent(
      localDevices.event$,
      'muteTrackChanged',
      ({ payload }) => {
        if (
          payload.mediaType === 'displayScreen' &&
          payload.stream === displayStream
        ) {
          setIsMutedDisplay(payload.isMuted);

          if (payload.isMuted) {
            setDisplayStream(undefined);
          }
        }
      },
    );

    const unsubscribeErrorDevicePermission = handleEvent(
      localDevices.event$,
      'errorDevicePermissions',
      ({ payload }) => {
        eventBus({
          type: 'error',
          payload: {
            title: payload.message,
          },
        });
      },
    );

    return () => {
      unsubscribeMuteChange();
      unsubscribeErrorDevicePermission();
    };
  }, [localDevices, displayStream, eventBus]);

  const toggleCamera = useCallback(async () => {
    if (!localDevices) {
      return;
    }

    setCameraStatus('pending');

    if (isMutedCamera) {
      localDevices
        .getSelectedVideoInputStream({ isMuted: false })
        .then((video) => {
          setVideoStream(video);
          setCameraStatus('success');
          setIsMutedCamera(!isMutedCamera);
        })
        .catch(() => {
          setCameraStatus('error');
        });
    } else {
      if (videoStream) {
        localDevices
          .releaseMediaStream(videoStream)
          .then(() => {
            setCameraStatus('success');
            setIsMutedCamera(!isMutedCamera);
          })
          .catch(() => {
            setCameraStatus('error');
          });
      }
    }
  }, [localDevices, videoStream, isMutedCamera]);

  const toggleAudio = useCallback(async () => {
    if (!localDevices) {
      return;
    }
    setAudioStatus('pending');

    if (isMutedAudio) {
      localDevices
        .getSelectedAudioInputStream({ isMuted: false })
        .then((audio) => {
          audioOutputMixer?.addMediaStream(audio);
          setAudioStream(audio);
          setAudioStatus('success');
          setIsMutedAudio(!isMutedAudio);
        })
        .catch(() => {
          setAudioStatus('error');
        });
    } else {
      if (audioStream) {
        audioOutputMixer?.removeMediaStream(audioStream);

        localDevices
          .releaseMediaStream(audioStream)
          .then(() => {
            setAudioStatus('success');
            setIsMutedAudio(!isMutedAudio);
          })
          .catch(() => {
            setAudioStatus('error');
          });
      }
    }
  }, [localDevices, audioStream, isMutedAudio, audioOutputMixer]);

  const toggleDesktop = useCallback(() => {
    if (!localDevices) return;

    setDisplayStatus('pending');

    if (isMutedDisplay) {
      localDevices
        .getDisplayInputStream()
        .then((stream) => {
          audioOutputMixer?.addMediaStream(stream);

          setDisplayStream(stream);
          setIsMutedDisplay(!isMutedDisplay);
          setDisplayStatus('success');
        })
        .catch((error) => {
          if (error instanceof ScreenShareUserCanceledError) {
            setDisplayStatus('idle');
            return;
          }
          setDisplayStatus('error');
        });
    } else {
      if (displayStream) {
        audioOutputMixer?.removeMediaStream(displayStream);

        localDevices
          .releaseMediaStream(displayStream)
          .then(() => {
            setDisplayStream(undefined);
            setIsMutedDisplay(!isMutedDisplay);
            setDisplayStatus('success');
          })
          .catch(() => {
            setDisplayStatus('error');
          });
      }
    }
  }, [localDevices, isMutedDisplay, displayStream, audioOutputMixer]);

  return (
    <Wrapper>
      <Title>Test toggle audio and video</Title>
      <WrapperVideo>
        <Video
          ref={videoElementRef}
          disablePictureInPicture
          autoPlay
          playsInline
          muted
          data-is-invert={true}
          data-is-card={!isMutedDisplay}
          data-is-hidden={isMutedCamera}
        />
        <Video
          ref={displayVideoElementRef}
          disablePictureInPicture
          autoPlay
          playsInline
          muted
          data-is-hidden={isMutedDisplay}
        />
        {isMutedCamera && isMutedDisplay ? (
          <VideoMuted>Video muted</VideoMuted>
        ) : null}
      </WrapperVideo>
      <Actions>
        <Button isLoading={cameraStatus === 'pending'} onClick={toggleCamera}>
          <IconCamera isMuted={isMutedCamera} />
          Toggle camera
        </Button>
        <Button isLoading={displayStatus === 'pending'} onClick={toggleDesktop}>
          <IconDisplayScreen isMuted={isMutedDisplay} />
          Toggle display
        </Button>
        <Button isLoading={audioStatus === 'pending'} onClick={toggleAudio}>
          <IconAudio isMuted={isMutedAudio} />
          Toggle audio
        </Button>
      </Actions>
      {cameraStatus === 'error' && <div>Access to camera is not allowed</div>}
      {audioStatus === 'error' && <div>Access to audio is not allowed</div>}
      {displayStatus === 'error' && <div>Access to display is not allowed</div>}
    </Wrapper>
  );
};
