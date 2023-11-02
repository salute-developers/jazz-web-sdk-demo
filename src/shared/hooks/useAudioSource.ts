import { useState } from 'react';

import {
  handleEvent,
  JazzRoom,
  JazzRoomParticipantId,
} from '@salutejs/jazz-sdk-web';

import { useEnhancedEffect } from './useEnhancedEffect';

export const useAudioSource = (options: {
  room: JazzRoom;
  participantId: JazzRoomParticipantId;
}): {
  isAudioMuted: boolean;
} => {
  const { participantId, room } = options;
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  useEnhancedEffect(() => {
    setIsAudioMuted(
      room.getParticipantSource(participantId, 'audio')?.isMuted ?? true,
    );

    const unsubscribeMuteChange = handleEvent(
      room.event$,
      'trackMuteChanged',
      ({ payload }) => {
        if (payload.participantId === participantId) {
          if (payload.mediaType === 'audio') {
            setIsAudioMuted(payload.isMuted);
          }
        }
      },
    );

    const unsubscribeAddTrack = handleEvent(
      room.event$,
      'addTrack',
      ({ payload }) => {
        if (payload.participantId === participantId) {
          if (payload.mediaType === 'audio') {
            setIsAudioMuted(payload.isMuted);
          }
        }
      },
    );

    const unsubscribeRemoveTrack = handleEvent(
      room.event$,
      'removeTrack',
      ({ payload }) => {
        if (payload.participantId === participantId) {
          if (payload.mediaType === 'audio') {
            setIsAudioMuted(true);
          }
        }
      },
    );

    return () => {
      unsubscribeMuteChange();
      unsubscribeAddTrack();
      unsubscribeRemoveTrack();
    };
  }, [participantId, room]);

  return {
    isAudioMuted,
  };
};
