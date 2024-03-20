import { useEffect, useState } from 'react';

import {
  handleEvent,
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

  return {
    isAudioMuted,
    isDisplayMuted,
    isVideoMuted,
  };
}
