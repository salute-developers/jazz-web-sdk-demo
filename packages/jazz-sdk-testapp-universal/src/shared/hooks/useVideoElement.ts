import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

import {
  JazzRoom,
  JazzRoomParticipantId,
} from '@salutejs/jazz-sdk-web';
import {
  getVideoElementPoolForRoom,
  VideoElementPoolForRoomVideoSource,
} from '@salutejs/jazz-sdk-web-plugins';

type VideoSource = VideoElementPoolForRoomVideoSource | undefined;

export function useVideoElement<
  E extends HTMLElement = HTMLElement,
  T extends VideoSource = VideoSource,
>(options: {
  room: JazzRoom;
  participantId: JazzRoomParticipantId | undefined;
  source: T;
}): {
  isVideoPaused: boolean;
  isVideoMuted: boolean;
  videoRootRef: RefObject<E>;
  source: T;
} {
  const { participantId, room, source } = options;
  const [isVideoPaused, setIsVideoPaused] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const videoElementPool = useMemo(() => {
    return getVideoElementPoolForRoom(room);
  }, [room]);

  const videoRootRef = useRef<E>(null);

  useEffect(() => {
    if (!participantId || !source) {
      return;
    }
    const {
      videoElement,
      isMuted,
      isPaused,
      on: eventsOn,
      release: releaseVideoElement,
    } = videoElementPool.getVideoElement(participantId, {
      source,
    });

    setIsVideoMuted(isMuted());
    setIsVideoPaused(isPaused());

    const unsubscribeUpdateTrack = eventsOn('trackUpdated', (_, payload) => {
      setIsVideoPaused(payload.isPaused);
      setIsVideoMuted(payload.isMuted);
    });

    const unsubscribePaused = eventsOn(
      'elementsPausedChanged',
      (_, payload) => {
        setIsVideoPaused(payload.isPaused);
      },
    );

    // Replace videoElement in videoContainer after change dependencies of useEffect
    videoRootRef.current?.replaceChildren(videoElement);

    return () => {
      unsubscribeUpdateTrack();
      unsubscribePaused();

      releaseVideoElement();
    };
  }, [participantId, room, source, videoElementPool]);

  return {
    isVideoMuted,
    isVideoPaused,
    videoRootRef,
    source,
  };
}
