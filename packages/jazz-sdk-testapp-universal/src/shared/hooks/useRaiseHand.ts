import { useEffect, useMemo, useState } from 'react';

import {
  getActivity,
  handleEvent,
  JazzActivity,
  JazzRoom,
  JazzRoomParticipantId,
} from '@salutejs/jazz-sdk-web';

import { useQuery } from './useQuery';

export function useRaiseHand(
  room: JazzRoom,
  roomParticipantId?: JazzRoomParticipantId,
): {
  isRaisedHand: boolean;
  activity: JazzActivity;
} {
  const localParticipant = useQuery(room.localParticipant);

  const participantId = roomParticipantId || localParticipant?.id;

  const [isRaisedHand, setisRaisedHand] = useState(false);

  const activity = useMemo(() => getActivity(room), [room]);

  useEffect(() => {
    if (!participantId) {
      return;
    }
    setisRaisedHand(activity.handsRaised().has(participantId));

    const unsubscribeRaiseHand = handleEvent(
      activity.event$,
      'raiseHand',
      ({ payload }) => {
        if (payload.participantId !== participantId) return;

        setisRaisedHand(true);
      },
    );

    const unsubscribeReleaseHand = handleEvent(
      activity.event$,
      'releaseHand',
      ({ payload }) => {
        if (payload.participantId !== participantId) return;

        setisRaisedHand(false);
      },
    );

    return () => {
      unsubscribeRaiseHand();
      unsubscribeReleaseHand();
    };
  }, [room, activity, participantId]);

  return {
    isRaisedHand,
    activity,
  };
}
