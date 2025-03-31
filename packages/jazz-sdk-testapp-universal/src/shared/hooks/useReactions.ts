import { useEffect, useMemo, useState } from 'react';

import {
  getActivity,
  JazzActivity,
  JazzActivityEventReaction,
  JazzReactionType,
  JazzRoom,
  JazzRoomParticipantId,
} from '@salutejs/jazz-sdk-web';
import { delay, filter, of, switchMap, tap } from 'rxjs';

import { useQuery } from './useQuery';

const REACTION_EXPIRATION_INTERVAL = 3_000; // ms

export function useReactions(
  room: JazzRoom,
  roomParticipantId?: JazzRoomParticipantId,
): {
  reaction: JazzReactionType | undefined;
  activity: JazzActivity;
} {
  const localParticipant = useQuery(room.localParticipant);

  const participantId = roomParticipantId || localParticipant?.id;

  const [reaction, setReaction] = useState<JazzReactionType | undefined>(
    undefined,
  );

  const activity = useMemo(() => getActivity(room), [room]);

  useEffect(() => {
    if (!participantId) {
      return;
    }

    const subscription = activity.event$
      .pipe(
        filter((event): event is JazzActivityEventReaction => event.type === 'reaction'),
        filter(({ payload }) => payload.participantId === participantId),
        tap(({ payload }) => {
          setReaction(payload.reaction);
        }),
        switchMap(({ payload }) =>
          of(payload).pipe(
            delay(REACTION_EXPIRATION_INTERVAL),
            tap(() => {
              setReaction(undefined);
            }),
          ),
        ),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [room, activity, participantId]);

  return {
    reaction,
    activity,
  };
}
