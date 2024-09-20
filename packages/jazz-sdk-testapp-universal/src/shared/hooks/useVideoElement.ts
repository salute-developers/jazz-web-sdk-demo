import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

import {
  handleEvent,
  handleEvents,
  JazzRoom,
  JazzRoomParticipantId,
  JazzRoomVideoSource,
} from '@salutejs/jazz-sdk-web';
import {
  ElementEvent,
  getVideoElementPool,
} from '@salutejs/jazz-sdk-web-plugins';
import { Observable } from 'rxjs';

import { createEventBus } from '../utils/createEventBus';

type VideoSource = JazzRoomVideoSource | undefined;

export function useVideoElement<
  E extends HTMLElement = HTMLElement,
  T extends VideoSource = VideoSource,
>(options: {
  room: JazzRoom;
  participantId: JazzRoomParticipantId | undefined;
  source: T;
  height: number;
  width: number;
}): {
  isVideoPaused: boolean;
  isVideoMuted: boolean;
  event$: Observable<ElementEvent>;
  videoRootRef: RefObject<E>;
  source: T;
} {
  const { height, width, participantId, room, source } = options;
  const [isVideoPaused, setIsVideoPaused] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const videoElementPool = useMemo(() => {
    return getVideoElementPool(room);
  }, [room]);

  const videoRootRef = useRef<E>(null);

  const [state] = useState(() => createEventBus<ElementEvent>());

  useEffect(() => {
    if (!participantId || !source) {
      return;
    }
    const { videoElement, isMuted, isPaused, event$, releaseElement } =
      videoElementPool.getElement(participantId, {
        source,
        height,
        width,
      });

    setIsVideoMuted(isMuted.get());
    setIsVideoPaused(isPaused.get());

    const unsubscribeEvents = handleEvents(event$, (event) => state(event));

    const unsubscribeAddTrack = handleEvent(
      event$,
      'addTrack',
      ({ payload }) => {
        setIsVideoPaused(payload.isPaused);
        setIsVideoMuted(payload.isMuted);
      },
    );

    const unsubscribeRemoveTrack = handleEvent(event$, 'removeTrack', () => {
      setIsVideoPaused(true);
      setIsVideoMuted(true);
    });

    const unsubscribeMuteChange = handleEvent(
      event$,
      'trackMuteChanged',
      ({ payload }) => {
        setIsVideoPaused(payload.isPaused);
        setIsVideoMuted(payload.isMuted);
      },
    );

    const unsubscribePaused = handleEvent(
      event$,
      'elementsPaused',
      ({ payload }) => {
        setIsVideoPaused(payload.isPaused);
      },
    );

    // Replace videoElement in videoContainer after change dependencies of useEffect
    videoRootRef.current?.replaceChildren(videoElement);

    return () => {
      unsubscribeAddTrack();
      unsubscribeRemoveTrack();
      unsubscribeMuteChange();
      unsubscribePaused();
      unsubscribeEvents();

      releaseElement();
    };
  }, [height, participantId, room, source, state, videoElementPool, width]);

  return {
    event$: state.event$,
    isVideoMuted,
    isVideoPaused,
    videoRootRef,
    source,
  };
}
