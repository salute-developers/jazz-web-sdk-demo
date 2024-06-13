import { FC } from 'react';

import { Body1, Button, Headline3, Modal } from '@salutejs/plasma-b2c';
import { backgroundPrimary } from '@salutejs/plasma-tokens';
import styled from 'styled-components/macro';

const InfoModalTitle = styled(Headline3).attrs({ mb: 24 })`
  text-align: center;
`;

const InfoModalText = styled(Body1).attrs({ mb: 24 })`
  text-align: center;
`;

const InfoModalContainer = styled(Modal)<{
  'data-type'?: 'error' | 'common';
}>`
  &[data-type='error'] {
    background: linear-gradient(
        279.93deg,
        rgba(41, 41, 41, 0.24) 25.58%,
        rgba(222, 8, 8, 0.24) 87.91%
      ),
      ${backgroundPrimary};
  }

  > button {
    display: none;
  }

  > div {
    padding: 24px;
  }
`;

export const InfoModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  modalType: 'error' | 'common';
  content: React.ReactNode;
  title: string;
  buttonTitle: string;
  buttonClick: () => void;
}> = ({
  isOpen,
  onClose,
  modalType,
  content,
  title,
  buttonTitle,
  buttonClick,
}) => (
    <InfoModalContainer data-type={modalType} isOpen={isOpen} onClose={onClose}>
      <InfoModalTitle mb={24}>{title}</InfoModalTitle>

      {content && <InfoModalText mb={24}>{content}</InfoModalText>}

      <Button stretch onClick={buttonClick}>
        {buttonTitle}
      </Button>
    </InfoModalContainer>
  );
