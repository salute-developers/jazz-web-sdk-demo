import { FC } from 'react';

import { Modal } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { useRoomContext } from '../../contexts/roomContext';
import { Participants } from '../Participants';
import { BubblingReactions } from '../ReactionsBubbling';

import { Footer } from './Footer';
import { Header } from './Header';
import { MainContent } from './MainContent';

const StyledModal = styled(Modal)`
  width: 90vw;
  height: 90vh;
  min-height: 400px;
  min-width: 500px;
  overflow: hidden;

  > div {
    padding: 0;
    height: 100%;
    display: grid;
    grid-template-rows: max-content 1fr max-content;
  }
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
    <StyledModal isOpen={isOpen} onClose={onClose}>
      <Header />
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
    </StyledModal>
  );
};
