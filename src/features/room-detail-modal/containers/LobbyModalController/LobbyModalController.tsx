import { FC, useCallback, useEffect, useState } from 'react';

import { handleEvent } from '@salutejs/jazz-sdk-web';

import { useRoomContext } from '../../contexts/roomContext';
import { LobbyModal } from '../LobbyModal/LobbyModal';

export const LobbyModalController: FC = () => {
  const { eventBus } = useRoomContext();

  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = handleEvent(eventBus.event$, 'openLobbyModal', () => {
      setOpen(true);
    });

    return () => {
      unsubscribe();
    };
  }, [eventBus]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return <LobbyModal isOpen={isOpen} onClose={handleClose} />;
};
