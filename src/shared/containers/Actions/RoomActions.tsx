import { FC, useCallback, useEffect, useState } from 'react';

import { handleEvent, JazzRoom } from '@salutejs/jazz-sdk-web';
import { Button } from '@salutejs/plasma-b2c';
import {
  IconCallEnd,
  IconCameraVideo,
  IconDevice,
  IconDisplay,
  IconMic,
  IconMicOff,
  IconVideoOff,
} from '@salutejs/plasma-icons';
import { useQuery } from 'rx-effects-react';
import styled from 'styled-components/macro';

import { useGlobalContext } from '../../contexts/globalContext';
import { useRaiseHand } from '../../hooks/useRaiseHand';
import { HandIcon } from '../../icons/HandIcon';

const Hand = styled(HandIcon)<{ 'data-is-active': boolean | undefined }>`
  height: 24px;
  width: 24px;
  color: #000;
  &[data-is-active] {
    color: #fff;
  }
`;

export const RoomActions: FC<{ room: JazzRoom; isShowRaiseHand?: boolean }> = ({
  room,
  isShowRaiseHand = false,
}) => {
  const { eventBus } = useGlobalContext();

  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isDisplayMuted, setIsDisplayMuted] = useState(true);

  const localParticipant = useQuery(room.localParticipant);

  const participantId = localParticipant?.id;

  useEffect(() => {
    if (!participantId) {
      return;
    }
    setIsDisplayMuted(
      room.getParticipantSource(participantId, 'displayScreen')?.isMuted ??
        true,
    );
    setIsAudioMuted(
      room.getParticipantSource(participantId, 'audio')?.isMuted ?? true,
    );
    setIsVideoMuted(
      room.getParticipantSource(participantId, 'video')?.isMuted ?? true,
    );

    const unsubscribeMuteChange = handleEvent(
      room.event$,
      'trackMuteChanged',
      ({ payload }) => {
        if (payload.participantId !== participantId) return;

        if (payload.mediaType === 'video') {
          setIsVideoMuted(payload.isMuted);
        } else if (payload.mediaType === 'audio') {
          setIsAudioMuted(payload.isMuted);
        } else if (payload.mediaType === 'displayScreen') {
          setIsDisplayMuted(payload.isMuted);
        }
      },
    );

    const unsubscribeAddTrack = handleEvent(
      room.event$,
      'addTrack',
      ({ payload }) => {
        if (payload.participantId !== participantId) return;

        if (payload.mediaType === 'video') {
          setIsVideoMuted(payload.isMuted);
        } else if (payload.mediaType === 'displayScreen') {
          setIsDisplayMuted(payload.isMuted);
        } else if (payload.mediaType === 'audio') {
          setIsAudioMuted(payload.isMuted);
        }
      },
    );

    const unsubscribeRemoveTrack = handleEvent(
      room.event$,
      'removeTrack',
      ({ payload }) => {
        if (payload.participantId !== participantId) return;

        if (payload.mediaType === 'video') {
          setIsVideoMuted(false);
        } else if (payload.mediaType === 'audio') {
          setIsAudioMuted(false);
        }
      },
    );

    return () => {
      unsubscribeAddTrack();
      unsubscribeMuteChange();
      unsubscribeRemoveTrack();
    };
  }, [room, participantId]);

  const handleLeave = useCallback(() => {
    room.leave();
  }, [room]);

  const handleToggleCamera = useCallback(async () => {
    try {
      await room.muteVideoInput(!isVideoMuted);
    } catch (error) {
      console.error(error);
      eventBus({ type: 'error', payload: { title: 'fail toggle camera' } });
    }
  }, [room, eventBus, isVideoMuted]);

  const handleToggleMic = useCallback(async () => {
    try {
      await room.muteAudioInput(!isAudioMuted);
    } catch (error) {
      console.error(error);
      eventBus({ type: 'error', payload: { title: 'fail toggle mic' } });
    }
  }, [room, eventBus, isAudioMuted]);

  const handleToggleDesktop = useCallback(async () => {
    try {
      await room.muteDisplayVideoInput(!isDisplayMuted);
    } catch (error) {
      console.error(error);
      eventBus({ type: 'error', payload: { title: 'fail toggle desktop' } });
    }
  }, [room, eventBus, isDisplayMuted]);

  const { isRaisedHand, activity } = useRaiseHand(room);

  const handleRaiseHand = useCallback(async () => {
    activity.raiseHand(!isRaisedHand);
  }, [activity, isRaisedHand]);

  return (
    <>
      {isShowRaiseHand && (
        <Button
          contentLeft={<Hand data-is-active={isRaisedHand || undefined} />}
          pin="circle-circle"
          view={isRaisedHand ? 'primary' : 'secondary'}
          aria-label="raise hand"
          title="raise hand"
          onClick={handleRaiseHand}
        />
      )}
      <Button
        contentLeft={isVideoMuted ? <IconVideoOff /> : <IconCameraVideo />}
        pin="circle-circle"
        aria-label="toggle camera"
        title="toggle camera"
        onClick={handleToggleCamera}
      />
      <Button
        contentLeft={isDisplayMuted ? <IconDisplay /> : <IconDevice />}
        pin="circle-circle"
        aria-label="toggle desktop"
        title="toggle desktop"
        onClick={handleToggleDesktop}
      />
      <Button
        contentLeft={isAudioMuted ? <IconMicOff /> : <IconMic />}
        pin="circle-circle"
        aria-label="toggle mic"
        title="toggle mic"
        onClick={handleToggleMic}
      />
      <Button
        contentLeft={<IconCallEnd />}
        view="critical"
        pin="circle-circle"
        aria-label="leave"
        title="leave"
        onClick={handleLeave}
      />
    </>
  );
};
