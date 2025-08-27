import { FC, useCallback, useEffect, useState } from 'react';

import { JazzRoom } from '@salutejs/jazz-sdk-web';
import { Headline3, TextField } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { Modal } from '../../shared/components/Modal';
import { useGlobalContext } from '../../shared/contexts/globalContext';

const StyledModal = styled(Modal)`
  width: 500px;
`;

const Title = styled(Headline3)`
  margin-bottom: 32px;
`;

const Wrapper = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 24px;
`;

export const RoomInfoModal: FC<{
  room: JazzRoom;
}> = ({ room }) => {
  const { event$ } = useGlobalContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleErrorSubscription = event$.subscribe((event) => {
      if (event.type === 'roomInfoModalOpen' && event.payload.room === room) {
        setIsOpen(true);
      }
    });

    return () => {
      handleErrorSubscription.unsubscribe();
    };
  }, [event$, room]);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const conferenceId = room.params.conferenceId;
  const conferencePassword = room.params.conferencePassword;

  return (
    <StyledModal isOpen={isOpen} onClose={handleClose}>
      <Title>Room Info</Title>
      <Wrapper>
        <TextField
          readOnly
          view="innerLabel"
          caption="Room id"
          value={conferenceId}
        />
        <TextField
          readOnly
          view="innerLabel"
          caption="Room password"
          value={conferencePassword}
        />
      </Wrapper>
    </StyledModal>
  );
};
