import { useEffect, useState } from 'react';

import {
  handleQuery,
  JazzRoom,
  JazzRoomParticipant,
} from '@salutejs/jazz-sdk-web';

export function useParticipantMediaMuted(
  room: JazzRoom,
  participant: JazzRoomParticipant | undefined,
): {
  isVideoMuted: boolean;
  isAudioMuted: boolean;
  isDisplayMuted: boolean;
} {
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isDisplayMuted, setIsDisplayMuted] = useState(true);

  const participantId = participant?.id;

  useEffect(() => {
    if (!participantId) {
      return;
    }
    const displayState = room.getParticipantMediaSource(
      participantId,
      'displayScreen',
    );
    const audioState = room.getParticipantMediaSource(participantId, 'audio');
    const videoState = room.getParticipantMediaSource(participantId, 'video');

    setIsDisplayMuted(displayState.isMuted());
    setIsAudioMuted(audioState.isMuted());
    setIsVideoMuted(videoState.isMuted());

    const unsubscribeDisplay = handleQuery(
      displayState.isMuted,
      setIsDisplayMuted,
    );
    const unsubscribeAudio = handleQuery(audioState.isMuted, setIsAudioMuted);
    const unsubscribeVideo = handleQuery(videoState.isMuted, setIsVideoMuted);

    return () => {
      unsubscribeDisplay();
      unsubscribeAudio();
      unsubscribeVideo();
    };
  }, [room, participantId]);

  return {
    isAudioMuted,
    isDisplayMuted,
    isVideoMuted,
  };
}
