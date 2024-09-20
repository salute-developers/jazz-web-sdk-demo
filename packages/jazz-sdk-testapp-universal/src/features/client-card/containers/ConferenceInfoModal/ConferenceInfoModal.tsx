import { FC } from 'react';

import {
  JazzSdkCreateAnonymousRoomDetails,
  JazzSdkCreateConferenceDetails,
} from '@salutejs/jazz-sdk-web';
import { Headline3, Modal, TextField } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

export type ConferenceInfoModalProps = {
  roomDetails:
    | JazzSdkCreateAnonymousRoomDetails
    | JazzSdkCreateConferenceDetails
    | undefined;
  onClose: () => void;
};

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
`;

export const ConferenceInfoModal: FC<ConferenceInfoModalProps> = ({
  roomDetails,
  onClose,
}) => {
  return (
    <StyledModal isOpen={Boolean(roomDetails)} onClose={onClose}>
      <Title>Room is creating!</Title>
      <Wrapper>
        <TextField readOnly caption="Id" value={roomDetails?.id} />
        <TextField readOnly caption="Password" value={roomDetails?.password} />
        <TextField readOnly caption="Title" value={roomDetails?.roomTitle} />
        <TextField readOnly caption="Type" value={roomDetails?.roomType} />
      </Wrapper>
    </StyledModal>
  );
};
