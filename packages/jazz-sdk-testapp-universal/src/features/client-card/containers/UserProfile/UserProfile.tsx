import { FC, useCallback, useEffect, useState } from 'react';

import { handleEvent, JazzClient } from '@salutejs/jazz-sdk-web';
import { Button, Headline3, TextField } from '@salutejs/plasma-b2c';
import { IconPersone } from '@salutejs/plasma-icons';
import styled from 'styled-components/macro';

import { Modal } from '../../../../shared/components/Modal';
import { useGlobalContext } from '../../../../shared/contexts/globalContext';
import { useQuery } from '../../../../shared/hooks/useQuery';

import { AuthModal } from './AuthModal';

export type UserProfileProps = {
  client: JazzClient;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  client: JazzClient;
};

const ModalTitle = styled(Headline3)`
  margin-bottom: 16px;
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
        <Button view="accent" onClick={() => setIsOpenAuthModal(true)}>
          Sign in
        </Button>
      )}

      {isAuthorised && (
        <Button
          view="secondary"
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

      <AuthModal
        isOpen={isOpenAuthModal}
        onClose={() => setIsOpenAuthModal(false)}
        client={client}
      />
    </>
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
