import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import {
  JazzSdkDesktopCapturerService,
  JazzSdkDesktopCapturerSource,
} from '@salutejs/jazz-sdk-electron-plugins/renderer';

import { useQuery } from 'jazz-sdk-testapp-universal/src/shared/hooks/useQuery';

import { InfoModal } from './InfoModal';
import {
  Action,
  Actions,
  Buttons,
  Container,
  ImgWrapper,
  SSourceItem,
  SSourcesWrapper,
  SSourceText,
  Title,
  Video,
} from './StyledComponents';
import { useVideoPool } from './useVideoPool';
import { VideoPool } from './utils';

export const ScreenSharePicker: FC<{
  desktopCapturer: JazzSdkDesktopCapturerService;
}> = ({ desktopCapturer }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenInfoModal, setIsOpenInfoModal] = useState(false);

  const accessStatus = useQuery(desktopCapturer.accessStatus);

  const status = useQuery(desktopCapturer.status);

  useEffect(() => {
    if (accessStatus && accessStatus === 'granted' && status === 'started') {
      setIsOpenModal(true);
    } else {
      setIsOpenModal(false);
    }

    if (accessStatus && accessStatus !== 'granted' && status === 'started') {
      setIsOpenInfoModal(true);
    } else {
      setIsOpenInfoModal(false);
    }
  }, [accessStatus, status]);

  const handleClose = useCallback(() => {
    desktopCapturer.cancel();
  }, [desktopCapturer]);

  const handleCloseInfoModal = useCallback(() => {
    desktopCapturer.cancel();
  }, [desktopCapturer]);

  const handleAccessGrant = useCallback(() => {
    desktopCapturer.openSystemSettings('screen-share-security');
  }, [desktopCapturer]);

  return (
    <>
      <Container
        isOpen={isOpenModal}
        onClose={handleClose}
        showCloseButton={false}
      >
        <Content desktopCapturer={desktopCapturer} onClose={handleClose} />
      </Container>

      <InfoModal
        onClose={handleCloseInfoModal}
        isOpen={isOpenInfoModal}
        content="Grant access to screen sharing in system settings"
        modalType="error"
        title="Access required"
        buttonTitle="Allow"
        buttonClick={handleAccessGrant}
      />
    </>
  );
};

const Content: FC<{
  desktopCapturer: JazzSdkDesktopCapturerService;
  onClose: () => void;
}> = ({ desktopCapturer, onClose }) => {
  const [selectedSource, setSelectedSource] = useState<
    JazzSdkDesktopCapturerSource | undefined
  >(undefined);

  const handleSubmit = useCallback(() => {
    if (!selectedSource) {
      return;
    }
    desktopCapturer.selectSource(selectedSource);
  }, [desktopCapturer, selectedSource]);

  const handleClickSource = useCallback(
    ({
      event,
      source,
    }: {
      event: React.MouseEvent<HTMLDivElement, MouseEvent>;
      source: JazzSdkDesktopCapturerSource;
    }) => {
      if (event.detail === undefined || event.detail === 1) {
        setSelectedSource(source);
      }

      // Handle the double click
      if (event.detail === 2) {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const sources = useQuery(desktopCapturer.sources);
  const videoPool = useVideoPool();
  return (
    <>
      <Title mb={24}>Screens to share</Title>

      <SSourcesWrapper>
        {sources?.map((source) => (
          <SourceView
            key={source.id}
            handleClickSource={handleClickSource}
            selectedSource={selectedSource}
            source={source}
            videoPool={videoPool}
          />
        ))}
      </SSourcesWrapper>

      <Actions>
        <Buttons>
          <Action size="s" onClick={onClose}>
            Cancel
          </Action>
          <Action
            view="primary"
            size="s"
            onClick={handleSubmit}
            disabled={!selectedSource}
          >
            Start share
          </Action>
        </Buttons>
      </Actions>
    </>
  );
};

const SourceView: FC<{
  source: JazzSdkDesktopCapturerSource;
  selectedSource: JazzSdkDesktopCapturerSource | undefined;
  videoPool: VideoPool;
  handleClickSource: (value: {
    event: React.MouseEvent<HTMLDivElement, MouseEvent>;
    source: JazzSdkDesktopCapturerSource;
  }) => void;
}> = ({ source, selectedSource, handleClickSource, videoPool }) => {
  const videoFrameRef = useRef<HTMLVideoElement>(null);
  const sourceId = source.id;
  useEffect(() => {
    videoPool.getVideoStream({ sourceId: sourceId }).then((stream) => {
      const element = videoFrameRef.current;
      if (!element) {
        videoPool.releaseVideoStream(sourceId);
        return;
      }

      element.srcObject = stream;
      element.play().catch(() => {});
    });

    return () => {
      videoPool.releaseVideoStream(sourceId);
    };
  }, [videoPool, sourceId]);

  return (
    <SSourceItem
      data-selected={source.id === selectedSource?.id || undefined}
      onClick={(event) => {
        handleClickSource({ event, source });
      }}
    >
      <ImgWrapper>
        <Video
          ref={videoFrameRef}
          disablePictureInPicture
          autoPlay
          playsInline
          muted
        />
      </ImgWrapper>
      <SSourceText>{source.name}</SSourceText>
    </SSourceItem>
  );
};
