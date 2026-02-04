import React, { FC } from 'react';

import styled from 'styled-components/macro';

import { Modal } from '../../../../shared/components/Modal';
import { useQuery } from '../../../../shared/hooks/useQuery';
import { useRoomContext } from '../../contexts/roomContext';

const StyledModal = styled(Modal)`
  width: 480px;
  height: 90vh;
  min-height: 400px;
  max-height: 560px;
  overflow-x: hidden;
  overflow-y: auto;
`;

const Root = styled.div`
  display: grid;
  align-items: baseline;
  gap: 8px;
`;

const ListContainer = styled.div`
  display: grid;
  grid-template-columns: 40% 60%;
  overflow: hidden;
`;

const ItemName = styled.div`
  padding: 8px;
  font-weight: bold;
  border-bottom: 1px solid #ccc;
  background-color: #f9f9f9;
`;

const ItemValue = styled.div`
  padding: 8px;
  border-bottom: 1px solid #ccc;
`;

export type RoomModalProps = {
  isOpen: boolean;
  participantId: string;
  onClose: () => void;
};

export const ParticipantInfoModal: FC<RoomModalProps> = ({
  isOpen,
  participantId,
  onClose,
}) => {
  const { room } = useRoomContext();

  const participants = useQuery(room.participants);

  const participant = participants.find(
    (participant) => participant.id === participantId,
  );

  if (!participant) {
    return null;
  }

  return (
    <StyledModal isOpen={isOpen} onClose={onClose}>
      <Root>
        <ListContainer>
          {Object.entries(participant).map(([key, value]) => (
            <React.Fragment key={key}>
              <ItemName>{key}</ItemName>
              <ItemValue>
                {(JSON.stringify(value) || '').replaceAll('"', '')}
              </ItemValue>
            </React.Fragment>
          ))}
        </ListContainer>
      </Root>
    </StyledModal>
  );
};
