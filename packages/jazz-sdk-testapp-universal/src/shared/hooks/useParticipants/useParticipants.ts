import { useMemo, useState } from 'react';

import {
  handleEvent,
  JazzRoom,
  JazzRoomParticipant,
  JazzRoomParticipantId,
} from '@salutejs/jazz-sdk-web';

import { useEnhancedEffect } from '../useEnhancedEffect';

import { changeWeight, changeWeightByDominant, sum } from './utils';

export function useParticipants(room: JazzRoom): JazzRoomParticipant[] {
  const [participants, setParticipants] = useState<JazzRoomParticipant[]>(
    () => [],
  );

  const [participantSortWeight, setParticipantSortWeight] = useState<
    Map<
      JazzRoomParticipantId,
      Set<'audio' | 'video' | 'displayScreen' | 'dominant'>
    >
  >(() => new Map());

  const resultParticipants = useMemo(() => participants.sort((a, b) => {
      const aWeight = sum(participantSortWeight.get(a.id));
      const bWeight = sum(participantSortWeight.get(b.id));

      return bWeight - aWeight;
    }), [participants, participantSortWeight]);

  useEnhancedEffect(() => {
    const participants = room.participants.get();
    setParticipants(participants);

    const unsubscribeParticipantsChanged = handleEvent(
      room.event$,
      'participants',
      ({ payload: { participants } }) => {
        setParticipants(participants);
      },
    );

    const unsubscribeDominantParticipantId = handleEvent(
      room.event$,
      'dominantSpeakerChanged',
      ({ payload }) => {
        setParticipantSortWeight(
          changeWeightByDominant({
            participantId: payload.id,
            prevParticipantId: payload.prevId,
          }),
        );
      },
    );

    setParticipantSortWeight((state) => {
      let newState = state;
      participants.forEach(({ id }) => {
        if (room.getParticipantSource(id, 'audio')?.isMuted === false) {
          newState = changeWeight({
            isMuted: false,
            mediaType: 'audio',
            participantId: id,
          })(newState);
        }

        if (room.getParticipantSource(id, 'video')?.isMuted === false) {
          newState = changeWeight({
            isMuted: false,
            mediaType: 'video',
            participantId: id,
          })(newState);
        }

        if (room.getParticipantSource(id, 'displayScreen')?.isMuted === false) {
          newState = changeWeight({
            isMuted: false,
            mediaType: 'displayScreen',
            participantId: id,
          })(newState);
        }
      });

      const participantId = room.dominantParticipantId.get();
      if (participantId) {
        newState = changeWeightByDominant({ participantId })(newState);
      }

      return newState;
    });

    const unsubscribeParticipantAddTrack = handleEvent(
      room.event$,
      'addTrack',
      ({ payload: { mediaType, participantId, isMuted } }) => {
        setParticipantSortWeight(
          changeWeight({ isMuted, mediaType, participantId }),
        );
      },
    );

    const unsubscribeParticipantMuteTrack = handleEvent(
      room.event$,
      'trackMuteChanged',
      ({ payload: { mediaType, participantId, isMuted } }) => {
        setParticipantSortWeight(
          changeWeight({ isMuted, mediaType, participantId }),
        );
      },
    );

    const unsubscribeParticipantRemoveTrack = handleEvent(
      room.event$,
      'removeTrack',
      ({ payload: { participantId } }) => {
        setParticipantSortWeight((state) => {
          state.delete(participantId);

          return state;
        });
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
      unsubscribeDominantParticipantId();
      unsubscribeParticipantsChanged();
      unsubscribeUpdate();
      unsubscribeParticipantAddTrack();
      unsubscribeParticipantMuteTrack();
      unsubscribeParticipantRemoveTrack();
    };
  }, [room]);

  return resultParticipants;
}
