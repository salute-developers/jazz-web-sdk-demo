import { useEffect, useState } from 'react';

import {
  handleEvent,
  JazzRoomMediaSourceState,
  JazzRoomParticipantId,
  JazzRoomVideoSource,
} from '@salutejs/jazz-sdk-web';

import { useRoomContext } from '../../features/room-card/contexts/roomContext';

export function useVideoSources(
  participantId: JazzRoomParticipantId | undefined,
): {
  primary: JazzRoomVideoSource;
  secondary?: JazzRoomVideoSource;
} {
  const { room } = useRoomContext();
  const [state, setState] = useState<{
    primary: JazzRoomVideoSource;
    secondary?: JazzRoomVideoSource;
  }>({
    primary: 'user',
  });

  useEffect(() => {
    if (!participantId) return;
    const displayScreenSource = room.getParticipantSource(
      participantId,
      'displayScreen',
    );

    const videoSource = room.getParticipantSource(participantId, 'video');

    setState(getVideoSources(videoSource, displayScreenSource));

    const addTrackUnsubscribe = handleEvent(
      room.event$,
      'addTrack',
      ({ payload }) => {
        if (payload.participantId !== participantId) return;

        if (
          payload.mediaType === 'displayScreen' ||
          payload.mediaType === 'video'
        ) {
          const displayScreenSource = room.getParticipantSource(
            participantId,
            'displayScreen',
          );

          const videoSource = room.getParticipantSource(participantId, 'video');

          setState(getVideoSources(videoSource, displayScreenSource));
        }
      },
    );

    const muteChangeUnsubscribe = handleEvent(
      room.event$,
      'trackMuteChanged',
      ({ payload }) => {
        if (payload.participantId !== participantId) return;

        if (
          payload.mediaType === 'displayScreen' ||
          payload.mediaType === 'video'
        ) {
          const displayScreenSource = room.getParticipantSource(
            participantId,
            'displayScreen',
          );

          const videoSource = room.getParticipantSource(participantId, 'video');

          setState(getVideoSources(videoSource, displayScreenSource));
        }
      },
    );

    return () => {
      addTrackUnsubscribe();
      muteChangeUnsubscribe();
    };
  }, [room, participantId]);

  return state;
}

function getVideoSources(
  videoSource: JazzRoomMediaSourceState | undefined,
  displayScreenSource: JazzRoomMediaSourceState | undefined,
): {
  primary: JazzRoomVideoSource;
  secondary?: JazzRoomVideoSource;
} {
  return displayScreenSource
    ? displayScreenSource.isMuted
      ? {
          primary: 'user',
        }
      : videoSource && !videoSource.isMuted
      ? {
          primary: 'display',
          secondary: 'user',
        }
      : {
          primary: 'display',
        }
    : {
        primary: 'user',
      };
}
