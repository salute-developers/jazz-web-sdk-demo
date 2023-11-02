import { useState } from 'react';

import {
  handleEvent,
  JazzRoom,
  JazzRoomParticipant,
} from '@salutejs/jazz-sdk-web';

import { useEnhancedEffect } from './useEnhancedEffect';

export function useParticipants(room: JazzRoom): JazzRoomParticipant[] {
  const [participants, setParticipants] = useState<JazzRoomParticipant[]>([]);

  useEnhancedEffect(() => {
    setParticipants(room.participants.get());

    const unsubscribeParticipantsChanged = handleEvent(
      room.event$,
      'participants',
      ({ payload: { participants } }) => {
        setParticipants(participants);
      },
    );

    const unsubscribeJoined = handleEvent(
      room.event$,
      'participantJoined',
      ({ payload }) => {
        setParticipants((participants) => {
          const newParticipants = [...participants];
          newParticipants.push(payload.participant);
          return newParticipants;
        });
      },
    );

    const unsubscribeLeft = handleEvent(
      room.event$,
      'participantLeft',
      ({ payload }) => {
        setParticipants((participants) =>
          participants.filter((item) => item.id !== payload.participant.id),
        );
      },
    );

    const unsubscribeUpdate = handleEvent(
      room.event$,
      'participantUpdate',
      ({ payload }) => {
        setParticipants((participants) => {
          const index = participants.findIndex(
            (item) => item.id === payload.participant.id,
          );

          if (index === -1) return participants;

          const newParticipants = [...participants];

          const oldParticipant = newParticipants[index];
          newParticipants.splice(index, 1, {
            ...oldParticipant,
            ...payload.participant,
          });

          return newParticipants;
        });
      },
    );

    return () => {
      unsubscribeJoined();
      unsubscribeLeft();
      unsubscribeParticipantsChanged();
      unsubscribeUpdate();
    };
  }, [room]);

  return participants;
}
