import { useState } from 'react';

import {
  handleQuery,
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
    if (!participantId) return;

    const state = room.getParticipantMediaSource(participantId, 'audio');

    setIsAudioMuted(state.isMuted());
    const unsubscribe = handleQuery(state.isMuted, setIsAudioMuted);

    return () => {
      unsubscribe();
    };
  }, [participantId, room]);

  return {
    isAudioMuted,
  };
};
