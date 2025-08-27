import { FC, useCallback, useState } from 'react';

import { createSdkToken, JazzClient } from '@salutejs/jazz-sdk-web';
import { Button, Headline3, TextArea, TextField } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { Modal } from '../../../../shared/components/Modal';
import { JAZZ_VALUE } from '../../../../shared/constants';
import { useClientsContext } from '../../../../shared/contexts/clientsContext';
import { useGlobalContext } from '../../../../shared/contexts/globalContext';

export type UserProfileProps = {
  client: JazzClient;
};

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  client: JazzClient;
};

const Body = styled.div`
  margin-top: 16px;
`;

const CustomTextField = styled(TextField)`
  margin-top: 16px;
`;

const Title = styled(Headline3)`
  margin-bottom: 16px;
`;

const StyledModal = styled(Modal)`
  width: 600px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;
  gap: 8px;
`;

export const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose, client }) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <StyledModal isOpen={isOpen} onClose={handleClose}>
      <SdkTokenAuth isOpen={isOpen} onClose={handleClose} client={client} />
    </StyledModal>
  );
};

const SdkTokenAuth: FC<AuthModalProps> = ({ onClose, client }) => {
  const { eventBus } = useGlobalContext();
  const { loginBySdkToken } = useClientsContext();

  const [value, setValue] = useState(() => {
    return sessionStorage.getItem(JAZZ_VALUE) || '';
  });

  const [userName, setUserName] = useState('');

  const handleLoginBySdkToken = useCallback(() => {
    const newUserName = userName || 'MyUserName';
    const sub = newUserName.replace(/ /g, '_');
    const iss = 'JazzTestApp';

    createSdkToken(value, {
      iss,
      userName: newUserName,
      sub,
    })
      .then(async ({ sdkToken }) => {
        const success = await client.auth.loginBySdkToken(sdkToken);
        if (!success) {
          eventBus({
            type: 'error',
            payload: { title: 'Error login by SDK Secret' },
          });
          return;
        }

        loginBySdkToken(client, { iss, sub, userName, value });

        sessionStorage.setItem(JAZZ_VALUE, value);

        onClose();
      })
      .catch((error) => {
        console.error(error);
        eventBus({
          type: 'error',
          payload: { title: 'Error login by SDK Secret' },
        });
      });
  }, [client, value, onClose, userName, eventBus, loginBySdkToken]);

  return (
    <Body>
      <Title>Auth by SDK Secret</Title>

      <TextArea
        leftHelper="write SDK secret"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />

      <CustomTextField
        caption="Your name"
        helperText='Or will be default is "MyUserName"'
        view="innerLabel"
        value={userName}
        onChange={(event) => setUserName(event.target.value)}
      />

      <ModalActions>
        <Button view="accent" disabled={!value} onClick={handleLoginBySdkToken}>
          Sign in
        </Button>
      </ModalActions>
    </Body>
  );
};
