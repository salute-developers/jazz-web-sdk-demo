import { FC, useCallback, useEffect, useState } from 'react';

import { Headline3, Modal } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { AudioGainSettings } from '../../../../shared/containers/AudioSettings';
import { MediaSettings } from '../../../../shared/containers/MediaSettings';
import { useGlobalContext } from '../../../../shared/contexts/globalContext';
import { useRoomContext } from '../../contexts/roomContext';
import { OptionsPermissions } from '../OptionsPermissions';
import { OptionsSettings } from '../OptionsSettings';
import { TitleSettings } from '../TitleSettings';
import { ViewVideo } from '../ViewVideo';

const ModalBody = styled.div`
  display: grid;
  gap: 32px;
`;

const StyledModal = styled(Modal)`
  width: 900px;
`;

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  > div {
    display: grid;
    gap: 24px;
    grid-auto-rows: min-content;
  }
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
    <StyledModal isOpen={isOpen} onClose={handleClose}>
      <ModalBody>
        <Headline3>Room Settings</Headline3>

        <Wrapper>
          <div>
            <TitleSettings />
            <OptionsSettings />
            <OptionsPermissions />
          </div>
          <div>
            <ViewVideo />
            <AudioGainSettings />
            <MediaSettings />
          </div>
        </Wrapper>
      </ModalBody>
    </StyledModal>
  );
};
