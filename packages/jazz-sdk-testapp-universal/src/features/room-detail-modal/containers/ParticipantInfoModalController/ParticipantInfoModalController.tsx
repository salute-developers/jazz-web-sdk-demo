import { FC, useCallback, useEffect, useState } from 'react';

import { handleEvent } from '@salutejs/jazz-sdk-web';

import { useRoomContext } from '../../contexts/roomContext';
import { ParticipantInfoModal } from '../ParticipantInfoModal';

export const ParticipantInfoModalController: FC = () => {
  const { eventBus } = useRoomContext();

  const [participantId, setParticipantId] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    const unsubscribe = handleEvent(
      eventBus.event$,
      'openParticipantInfoModal',
      ({ payload: { participantId } }) => {
        setParticipantId(participantId);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [eventBus]);

  const handleClose = useCallback(() => {
    setParticipantId(undefined);
  }, []);

  if (!participantId) {
    return null;
  }

  return (
    <ParticipantInfoModal
      participantId={participantId}
      isOpen={Boolean(participantId)}
      onClose={handleClose}
    />
  );
};
