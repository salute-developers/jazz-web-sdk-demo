import { FC, useCallback, useEffect, useState } from 'react';

import {
  createSdkToken,
  handleEvent,
  JazzClient,
} from '@salutejs/jazz-sdk-web';
import {
  Button,
  Headline3,
  Modal,
  TextArea,
  TextField,
} from '@salutejs/plasma-b2c';
import { IconPersone } from '@salutejs/plasma-icons';
import styled from 'styled-components/macro';

import { JAZZ_VALUE } from '../../../../shared/constants';
import { useClientsContext } from '../../../../shared/contexts/clientsContext';
import { useGlobalContext } from '../../../../shared/contexts/globalContext';
import { useQuery } from '../../../../shared/hooks/useQuery';

export type UserProfileProps = {
  client: JazzClient;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  client: JazzClient;
};

const CustomTextField = styled(TextField)`
  margin-top: 16px;
`;

const ModalTitle = styled(Headline3)`
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

export const UserProfile: FC<UserProfileProps> = ({ client }) => {
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isOpenAuthModal, setIsOpenAuthModal] = useState(false);
  const [isOpenProfileModal, setIsOpenProfileModal] = useState(false);

  useEffect(() => {
    setIsAuthorised(client.auth.isAuthorised.get());

    const logInUnsubscribe = handleEvent(
      client.auth.event$,
      'authorised',
      () => {
        setIsAuthorised(true);
      },
    );

    const logOutUnsubscribe = handleEvent(
      client.auth.event$,
      'loggedOut',
      () => {
        setIsOpenProfileModal(false);
        setIsAuthorised(false);
      },
    );

    return () => {
      logInUnsubscribe();
      logOutUnsubscribe();
    };
  }, [client.auth]);

  return (
    <>
      {!isAuthorised && (
        <Button view="primary" onClick={() => setIsOpenAuthModal(true)}>
          Sign in
        </Button>
      )}

      {isAuthorised && (
        <Button
          pin="circle-circle"
          contentLeft={<IconPersone />}
          onClick={() => setIsOpenProfileModal(true)}
        />
      )}

      <ProfileModal
        isOpen={isOpenProfileModal}
        onClose={() => setIsOpenProfileModal(false)}
        client={client}
      />

      <ModalAuth
        isOpen={isOpenAuthModal}
        onClose={() => setIsOpenAuthModal(false)}
        client={client}
      />
    </>
  );
};

const ModalAuth: FC<ModalProps> = ({ isOpen, onClose, client }) => {
  const { eventBus } = useGlobalContext();
  const { loginBySdkToken } = useClientsContext();

  const [value, setValue] = useState(() => {
    return sessionStorage.getItem(JAZZ_VALUE) || '';
  });

  const [userName, setUserName] = useState('');

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleLoginBySdkToken = useCallback(() => {
    const newUserName = userName || 'MyUserName';
    const sub = newUserName;
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

        handleClose();
      })
      .catch((error) => {
        console.error(error);
        eventBus({
          type: 'error',
          payload: { title: 'Error login by SDK Secret' },
        });
      });
  }, [client, value, handleClose, userName, eventBus, loginBySdkToken]);

  return (
    <StyledModal isOpen={isOpen} onClose={handleClose}>
      <ModalTitle>Auth by SDK Secret</ModalTitle>

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
        <Button
          view="primary"
          disabled={!value}
          onClick={handleLoginBySdkToken}
        >
          Sign in
        </Button>
      </ModalActions>
    </StyledModal>
  );
};

const ProfileModal: FC<ModalProps> = ({ isOpen, onClose, client }) => {
  const { eventBus } = useGlobalContext();

  const userInfo = useQuery(client.auth.userInfo);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSignOut = useCallback(() => {
    client.auth
      .logout()
      .then(() => {
        handleClose();
      })
      .catch((error) => {
        console.error(error);
        eventBus({
          type: 'error',
          payload: { title: 'fail logout' },
        });
      });
  }, [client, handleClose, eventBus]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalTitle>Profile</ModalTitle>

      {userInfo?.name && (
        <TextField readOnly caption="Your name" value={userInfo?.name} />
      )}

      {userInfo?.email && (
        <TextField readOnly caption="Your email" value={userInfo?.email} />
      )}

      <ModalActions>
        <Button view="critical" onClick={handleSignOut}>
          SignOut
        </Button>
      </ModalActions>
    </Modal>
  );
};
