import { FC } from 'react';

import { JazzRoom, JazzRoomParticipantId } from '@salutejs/jazz-sdk-web';
import styled from 'styled-components/macro';

import { Reaction } from '../../../../shared/components/Reaction';
import { useReactions } from '../../../../shared/hooks/useReactions';

const Root = styled.div`
  height: 24px;
  width: 24px;
  padding: 12px;
`;

export const ParticipantReaction: FC<{
  room: JazzRoom;
  participantId: JazzRoomParticipantId;
}> = ({ participantId, room }) => {
  const { reaction } = useReactions(room, participantId);

  if (!reaction) {
    return null;
  }

  return (
    <Root>
      <Reaction reaction={reaction} />
    </Root>
  );
};
