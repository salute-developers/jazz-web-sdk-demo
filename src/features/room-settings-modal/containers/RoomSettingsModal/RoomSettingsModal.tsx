import { FC, useCallback, useEffect, useState } from 'react';

import { Headline3, Modal } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { AudioGainSettings } from '../../../../shared/containers/AudioSettings';
import { MediaSettings } from '../../../../shared/containers/MediaSettings';
import { useGlobalContext } from '../../../../shared/contexts/globalContext';
import { useRoomContext } from '../../contexts/roomContext';
import { ViewVideo } from '../ViewVideo';

const Title = styled(Headline3)`
  margin-bottom: 16px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const RoomSettingsModal: FC = () => {
  const { event$ } = useGlobalContext();
  const { room } = useRoomContext();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleErrorSubscribtion = event$.subscribe((event) => {
      if (event.type === 'roomSettingsOpen' && event.payload.room === room) {
        setIsOpen(true);
      }
    });

    return () => {
      handleErrorSubscribtion.unsubscribe();
    };
  }, [event$, room]);

  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Title>Room Settings</Title>

      <Wrapper>
        <ViewVideo />
        <AudioGainSettings />
        <MediaSettings />
      </Wrapper>
    </Modal>
  );
};
