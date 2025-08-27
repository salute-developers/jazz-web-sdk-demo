import { FC } from 'react';

import styled from 'styled-components/macro';

import { Modal } from '../../../../shared/components/Modal';
import { useRoomContext } from '../../contexts/roomContext';
import { Participants } from '../Participants';
import { BubblingReactions } from '../ReactionsBubbling';

import { Footer } from './Footer';
import { Header } from './Header';
import { MainContent } from './MainContent';

const ModalBody = styled.div`
  width: 90vw;
  height: 90vh;
  min-height: 400px;
  min-width: 500px;
  overflow: hidden;
  padding: 0;
  display: grid;
  grid-template-rows: max-content 1fr max-content;
  background: #fff;
  box-shadow: 0 5px 18px #0000002e;
  border-radius: 16px;
`;

const Wrapper = styled.div`
  display: flex;
  min-height: 100%;
`;

const LeftContentWrapper = styled.div`
  min-width: 272px;
  box-sizing: border-box;
  padding: 0;
  display: grid;
`;

const MainContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  padding: 0 16px 0 0;
`;

export type RoomModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const RoomModal: FC<RoomModalProps> = ({ isOpen, onClose }) => {
  const { room } = useRoomContext();

  return (
    <Modal isOpen={isOpen} disableBody onClose={onClose}>
      <ModalBody>
        <Header onClose={onClose} />
        <Wrapper>
          <LeftContentWrapper>
            <Participants />
          </LeftContentWrapper>
          <MainContentWrapper>
            <MainContent />
          </MainContentWrapper>
        </Wrapper>
        <Footer />
        <BubblingReactions room={room} />
      </ModalBody>
    </Modal>
  );
};
