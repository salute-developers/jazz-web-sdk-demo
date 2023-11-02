import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getLocalDevices, handleEvent } from '@salutejs/jazz-sdk-web';
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
import { dark01, white } from '@salutejs/plasma-tokens-b2c/colors';
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

const Video = styled.video`
  pointer-events: none;
  height: 100%;
  transform: scaleX(-1);
  object-fit: cover;
  width: 100%;
  display: block;
  background: ${dark01};
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
  return <IconWrapper>{isMuted ? <IconDisplay /> : <IconDevice />}</IconWrapper>;
};

type Status = 'idle' | 'success' | 'error' | 'pending';

export const Lobby: FC = () => {
  const { sdk } = useGlobalContext();

  const [videoStream, setVideoStream] = useState<MediaStream | undefined>();
  const [audioStream, setAudioStream] = useState<MediaStream | undefined>();
  const [displayStream, setDisplayStream] = useState<MediaStream | undefined>();

  const [isMutedCamera, setIsMutedCamera] = useState(true);
  const [isMutedAudio, setIsMutedAudio] = useState(true);
  const [isMutedDisplay, setIsMutedDisplay] = useState(true);

  const [cameraStatus, setCameraStatus] = useState<Status>('idle');
  const [audioStatus, setAudioStatus] = useState<Status>('idle');
  const [displayStatus, setDisplayStatus] = useState<Status>('idle');

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

    const activeStream = !isMutedDisplay ? displayStream : videoStream;

    videoElementRef.current.srcObject = activeStream || null;
    videoElementRef.current.load();
    videoElementRef.current.play().catch(() => {});
  }, [
    videoElementRef,
    displayStream,
    videoStream,
    isMutedDisplay,
  ]);

  useEffect(() => {
    if (!localDevices) return;

    const unsubscribeMuteChange = handleEvent(
      localDevices.event$,
      'muteTrackChanged',
      ({ payload }) => {
        if (payload.mediaType === 'displayScreen' && payload.stream === displayStream) {
          setIsMutedDisplay(payload.isMuted);

          if (payload.isMuted) {
            setDisplayStream(undefined);
          }
        }
      },
    );

    return () => {
      unsubscribeMuteChange();
    }
  }, [localDevices, displayStream]);

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
      localDevices.getDisplayInputStream()
        .then((stream) => {
          setDisplayStream(stream);
          setIsMutedDisplay(!isMutedDisplay);
          setDisplayStatus('success');
        })
        .catch(() => {
          setDisplayStatus('error');
        });
    } else {
      if (displayStream) {
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
  }, [localDevices, isMutedDisplay, displayStream]);

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
        />
        {isMutedCamera && isMutedDisplay ? <VideoMuted>Video muted</VideoMuted> : null}
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
