import { JazzRoomParticipantId, MediaType } from '@salutejs/jazz-sdk-web';

import { SortType } from './types';

const SORT_WEIGHT: Record<SortType, number> = {
  audio: 10,
  displayScreen: 100,
  dominant: 11,
  video: 10,
};

export const changeWeight =
  ({
    participantId,
    isMuted,
    mediaType,
  }: {
    isMuted: boolean;
    mediaType: MediaType;
    participantId: JazzRoomParticipantId;
  }) =>
  (
    state: Map<JazzRoomParticipantId, Set<SortType>>,
  ): Map<JazzRoomParticipantId, Set<SortType>> => {
    const newState = new Map<JazzRoomParticipantId, Set<SortType>>(state);
    const weight = newState.get(participantId) || new Set<SortType>();

    if (isMuted) {
      weight.delete(mediaType);
    } else {
      weight.add(mediaType);
    }

    newState.set(participantId, weight);

    return newState;
  };

export const changeWeightByDominant =
  ({
    participantId,
    prevParticipantId,
  }: {
    participantId: JazzRoomParticipantId;
    prevParticipantId?: JazzRoomParticipantId | undefined;
  }) =>
  (
    state: Map<JazzRoomParticipantId, Set<SortType>>,
  ): Map<JazzRoomParticipantId, Set<SortType>> => {
    const newState = new Map<JazzRoomParticipantId, Set<SortType>>(state);
    if (prevParticipantId) {
      const prevParticipantWeight =
        newState.get(prevParticipantId) || new Set<SortType>();
      prevParticipantWeight.delete('dominant');
      newState.set(prevParticipantId, prevParticipantWeight);
    }

    const participantWeight =
      newState.get(participantId) || new Set<SortType>();

    participantWeight.add('dominant');
    newState.set(participantId, participantWeight);

    return newState;
  };

export function sum(value: Set<SortType> | undefined): number {
  if (!value) {
    return 0;
  }
  return [...value].reduce((acc, curr) => acc + SORT_WEIGHT[curr], 0);
}
