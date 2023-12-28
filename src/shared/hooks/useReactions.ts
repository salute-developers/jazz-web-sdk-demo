import { useEffect, useMemo, useState } from 'react';

import {
  getActivity,
  handleEvent,
  JazzActivity,
  JazzReactionType,
  JazzRoom,
  JazzRoomParticipantId,
} from '@salutejs/jazz-sdk-web';
import { useQuery } from 'rx-effects-react';

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
    setReaction(activity.reactions.get().get(participantId)?.reaction);

    const unsubscribeReaction = handleEvent(
      activity.event$,
      'reaction',
      ({ payload }) => {
        if (payload.participantId !== participantId) return;

        setReaction(payload.reaction);
      },
    );

    const unsubscribeReleaseReaction = handleEvent(
      activity.event$,
      'releaseReaction',
      ({ payload }) => {
        if (payload.participantId !== participantId) return;

        setReaction(undefined);
      },
    );

    return () => {
      unsubscribeReaction();
      unsubscribeReleaseReaction();
    };
  }, [room, activity, participantId]);

  return {
    reaction,
    activity,
  };
}
