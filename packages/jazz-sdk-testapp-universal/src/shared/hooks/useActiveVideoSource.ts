import { useEffect, useState } from 'react';

import {
  handleQuery,
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

    const displayState = room.getParticipantMediaSource(
      participantId,
      'displayScreen',
    );
    const videoState = room.getParticipantMediaSource(participantId, 'video');

    function handleUpdateState(): void {
      setState(
        getVideoSources(
          { isMuted: videoState.isMuted(), stream: videoState.stream() },
          { isMuted: displayState.isMuted(), stream: displayState.stream() },
        ),
      );
    }

    handleUpdateState();

    const subscriberVideoMuted = handleQuery(
      videoState.isMuted,
      handleUpdateState,
    );
    const subscriberVideoStream = handleQuery(
      videoState.stream,
      handleUpdateState,
    );

    const subscriberDisplayMuted = handleQuery(
      displayState.isMuted,
      handleUpdateState,
    );
    const subscriberDisplayStream = handleQuery(
      displayState.stream,
      handleUpdateState,
    );

    return () => {
      subscriberVideoMuted();
      subscriberVideoStream();

      subscriberDisplayMuted();
      subscriberDisplayStream();
    };
  }, [room, participantId]);

  return state;
}

function getVideoSources(
  videoSource: JazzRoomMediaSourceState,
  displayScreenSource: JazzRoomMediaSourceState,
): {
  primary: JazzRoomVideoSource;
  secondary?: JazzRoomVideoSource;
} {
  return displayScreenSource.isMuted
    ? { primary: 'user' }
    : !videoSource.isMuted
      ? {
          primary: 'display',
          secondary: 'user',
        }
      : {
          primary: 'display',
        };
}
