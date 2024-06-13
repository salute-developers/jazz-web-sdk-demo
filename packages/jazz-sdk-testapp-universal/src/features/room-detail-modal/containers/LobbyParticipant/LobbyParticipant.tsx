import { forwardRef, useCallback } from 'react';

import { getLobby, JazzLobbyParticipant } from '@salutejs/jazz-sdk-web';
import { Button } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { useRoomContext } from '../../contexts/roomContext';

const Root = styled.div`
  padding: 12px 24px;
  display: grid;
  grid-template-columns: 1fr max-content max-content;
  gap: 8px;
  align-items: center;
`;

const Text = styled.div`
  font-weight: bold;
  text-overflow: ellipsis;
  overflow-x: hidden;
  white-space: nowrap;
`;

export const LobbyParticipant = forwardRef<
  HTMLDivElement,
  {
    lobbyParticipant: JazzLobbyParticipant;
  }
>(({ lobbyParticipant, ...otherProps }, ref) => {
  const { room } = useRoomContext();
  const lobby = getLobby(room);

  const handleApprove = useCallback(() => {
    lobby.moderator.approveAccess(lobbyParticipant.id);
  }, [lobby, lobbyParticipant]);

  const handleDeny = useCallback(() => {
    lobby.moderator.denyAccess(lobbyParticipant.id);
  }, [lobby, lobbyParticipant]);

  return (
    <Root {...otherProps} ref={ref}>
      <Text>{lobbyParticipant.userName}</Text>
      <Button text="Approve" view="primary" onClick={handleApprove} />
      <Button text="Deny" onClick={handleDeny} />
    </Root>
  );
});
