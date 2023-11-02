import { FC, useCallback, useEffect, useState } from 'react';

import { JazzRoom, JazzRoomParams } from '@salutejs/jazz-sdk-web';
import { Headline3, Modal, TextField } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

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
    const handleErrorSubscribtion = event$.subscribe((event) => {
      if (event.type === 'roomInfoModalOpen' && event.payload.room === room) {
        setIsOpen(true);
      }
    });

    return () => {
      handleErrorSubscribtion.unsubscribe();
    };
  }, [event$, room]);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const [roomParams, setRoomParams] = useState<JazzRoomParams | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!room || !isOpen) return;

    room.ready().then(() => {
      const params = room.params.get();
      setRoomParams(params);
    });
  }, [room, isOpen]);

  return (
    <StyledModal isOpen={isOpen} onClose={handleClose}>
      <Title>Room Info</Title>
      <TextField
        view="innerLabel"
        readOnly
        caption="domainUrl"
        value={roomParams?.domainUrl}
      />
      <Wrapper>
        <TextField
          readOnly
          view="innerLabel"
          caption="conferenceId"
          value={roomParams?.conferenceId}
        />
        <TextField
          readOnly
          view="innerLabel"
          caption="conferencePassword"
          value={roomParams?.conferencePassword}
        />
      </Wrapper>
    </StyledModal>
  );
};
