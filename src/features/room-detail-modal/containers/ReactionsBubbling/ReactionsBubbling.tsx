import { FC, useEffect, useMemo, useRef, useState } from 'react';

import {
  getActivity,
  handleEvent,
  JazzParticipantReaction,
  JazzRoom,
} from '@salutejs/jazz-sdk-web';
import styled, { keyframes } from 'styled-components/macro';

import { Reaction } from '../../../../shared/components/Reaction';

const REACTION_EXPIRATION_INTERVAL = 3_000; // ms

const StyledBubblingReactions = styled.div`
  position: absolute;
  left: 24px;
  bottom: 64px;
  top: 0;
  z-index: 150;
`;

const animUp = keyframes`
  from {
    opacity: 0;
    transform: scale(1) translateY(0);
  }

  10% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  to {
    opacity: 0;
    transform: scale(0.5) translateY(-300px);
  }
`;

function calcReactionXCoord(offset: number): number {
  if (offset < 3) return offset * 64;

  return (offset - 3) * 64 + 32;
}

const AnimatedReaction = styled.div`
  position: absolute;
  bottom: 0;
  animation: ${animUp} 3s ease-in forwards;
  transition: 0.3s all;
  will-change: opacity, transform;
`;

type IndexedParticipantReaction = Readonly<
  JazzParticipantReaction & { index: number }
>;

export function useReactions(room: JazzRoom): {
  indexedReactions: ReadonlyArray<IndexedParticipantReaction>;
} {
  const activity = useMemo(() => getActivity(room), [room]);

  const [state, setState] = useState<ReadonlyArray<IndexedParticipantReaction>>(
    [],
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let nextIndex = 0;

    const unsubscribeReaction = handleEvent(
      activity.event$,
      'reaction',
      ({ payload }) => {
        if (stateRef.current.length === 0) {
          nextIndex = 0;
        }

        const newEntry = { ...payload, index: nextIndex };
        nextIndex += 1;

        setState((prevState) => [...prevState, newEntry]);
      },
    );

    const unsubscribeReleaseReaction = handleEvent(
      activity.event$,
      'releaseReaction',
      () => {
        const expirationDate = Date.now() - REACTION_EXPIRATION_INTERVAL;

        const prevItems = stateRef.current;
        const nextItems = prevItems.filter(
          (item) => item.timestamp >= expirationDate,
        );
        if (nextItems.length !== prevItems.length) {
          setState(nextItems);
        }
        if (nextItems.length === 0) {
          nextIndex = 0;
        }
      },
    );

    return () => {
      unsubscribeReaction();
      unsubscribeReleaseReaction();
    };
  }, [room, activity]);

  return {
    indexedReactions: state,
  };
}

export const BubblingReactions: FC<{ room: JazzRoom }> = ({ room }) => {
  const { indexedReactions } = useReactions(room);

  return (
    <StyledBubblingReactions>
      {indexedReactions.map(({ reaction, index }) => (
        <AnimatedReaction
          key={index}
          style={{ left: calcReactionXCoord(index % 5) }}
        >
          <Reaction reaction={reaction} />
        </AnimatedReaction>
      ))}
    </StyledBubblingReactions>
  );
};
