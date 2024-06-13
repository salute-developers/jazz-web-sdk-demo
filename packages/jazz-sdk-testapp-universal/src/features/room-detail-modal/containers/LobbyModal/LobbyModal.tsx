import { FC, useCallback } from 'react';

import { getLobby } from '@salutejs/jazz-sdk-web';
import { Button, Headline3, Modal } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { useQuery } from '../../../../shared/hooks/useQuery';
import { useRoomContext } from '../../contexts/roomContext';
import { LobbyParticipants } from '../LobbyParticipants';

const StyledModal = styled(Modal)`
  width: 420px;
  height: 90vh;
  min-height: 400px;
  max-height: 560px;
  overflow: hidden;

  > div {
    padding: 0;
    height: 100%;
    display: grid;
    grid-template-rows: max-content 1fr max-content;
  }
`;

const Footer = styled.div`
  padding: 8px;
  display: grid;
  grid-template-rows: max-content max-content;
  gap: 8px;
  padding: 24px;
`;

const Header = styled.div`
  padding: 32px 24px 24px;
`;

export type RoomModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const LobbyModal: FC<RoomModalProps> = ({ isOpen, onClose }) => {
  const { room } = useRoomContext();
  const lobby = getLobby(room);

  const participants = useQuery(lobby.participants);

  const handleApprove = useCallback(() => {
    lobby.moderator.approveAccessAll();
  }, [lobby]);

  const handleDeny = useCallback(() => {
    lobby.moderator.denyAccessAll();
  }, [lobby]);

  const isDisabled = participants.length === 0;

  return (
    <StyledModal isOpen={isOpen} onClose={onClose}>
      <Header>
        <Headline3>Participants</Headline3>
      </Header>
      <LobbyParticipants />
      <Footer>
        <Button
          text="Approve all"
          view="primary"
          disabled={isDisabled}
          onClick={handleApprove}
        />
        <Button text="Deny all" disabled={isDisabled} onClick={handleDeny} />
      </Footer>
    </StyledModal>
  );
};
