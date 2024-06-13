import { FC, useCallback, useEffect, useState } from 'react';

import { JazzRoom } from '@salutejs/jazz-sdk-web';
import { Headline3, Modal, TextField } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { useGlobalContext } from '../../shared/contexts/globalContext';
import { useQuery } from '../../shared/hooks/useQuery';

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

  const domainUrl = useQuery(room.params.domainUrl);
  const conferenceId = useQuery(room.params.conferenceId);
  const conferencePassword = useQuery(room.params.conferencePassword);

  return (
    <StyledModal isOpen={isOpen} onClose={handleClose}>
      <Title>Room Info</Title>
      <TextField
        view="innerLabel"
        readOnly
        caption="domainUrl"
        value={domainUrl}
      />
      <Wrapper>
        <TextField
          readOnly
          view="innerLabel"
          caption="conferenceId"
          value={conferenceId}
        />
        <TextField
          readOnly
          view="innerLabel"
          caption="conferencePassword"
          value={conferencePassword}
        />
      </Wrapper>
    </StyledModal>
  );
};
