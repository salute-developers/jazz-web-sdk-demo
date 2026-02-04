import { FC, useCallback, useEffect, useState } from 'react';

import { handleEvent } from '@salutejs/jazz-sdk-web';
import { BodyL, Button, Headline3 } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { Modal } from '../../shared/components/Modal';
import { useGlobalContext } from '../../shared/contexts/globalContext';
import { ErrorEvent } from '../../shared/types/globalContext';

const StyledHeader = styled(Headline3)`
  margin-bottom: 16px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;
`;

export const ErrorModal: FC = () => {
  const { event$ } = useGlobalContext();

  const [error, setError] = useState<ErrorEvent['payload'] | undefined>(
    undefined,
  );

  useEffect(() => {
    const handleErrorSubscribtion = handleEvent(event$, 'error', (event) => {
      setError(event.payload);
    });

    return () => {
      handleErrorSubscribtion();
    };
  }, [event$]);

  const handleClose = useCallback(() => setError(undefined), []);

  const isOpen = Boolean(error);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <StyledHeader>Oops! An error has occurred!</StyledHeader>
      <BodyL>{error?.title}</BodyL>
      <Actions>
        <Button onClick={handleClose} view="accent">
          OK
        </Button>
      </Actions>
    </Modal>
  );
};
