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
import { useQuery } from 'rx-effects-react';
import styled from 'styled-components/macro';

import {
  JAZZ_VALUE,
  JOIN_CONFERENCE_USER_NAME_KEY,
} from '../../../../shared/constants';
import { useGlobalContext } from '../../../../shared/contexts/globalContext';

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
          SignIn
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

  const [value, setValue] = useState(() => {
    return sessionStorage.getItem(JAZZ_VALUE) || '';
  });

  const [userName, setUserName] = useState(() => {
    return sessionStorage.getItem(JOIN_CONFERENCE_USER_NAME_KEY) || '';
  });

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleLoginBySdkToken = useCallback(() => {
    const newUserName = userName || 'MyUserName';
    createSdkToken(value, {
      iss: 'JazzTestApp',
      userName: newUserName,
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

        sessionStorage.setItem(JAZZ_VALUE, value);
        sessionStorage.setItem(JOIN_CONFERENCE_USER_NAME_KEY, newUserName);

        handleClose();
      })
      .catch((error) => {
        console.error(error);
        eventBus({
          type: 'error',
          payload: { title: 'Error login by SDK Secret' },
        });
      });
  }, [client, value, handleClose, userName, eventBus]);

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
          SignIn
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
          payload: { title: 'fail login by sdk token' },
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
