import { FC, useCallback, useEffect, useState } from 'react';

import { handleEvent } from '@salutejs/jazz-sdk-web';
import { Button, Headline3 } from '@salutejs/plasma-b2c';
import { IconSettings } from '@salutejs/plasma-icons';
import styled from 'styled-components/macro';

import { useGlobalContext } from '../../../../shared/contexts/globalContext';
import { useRoomContext } from '../../contexts/roomContext';

const Wrapper = styled.div`
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  padding: 32px 16px;
  box-sizing: border-box;
  gap: 16px;
`;

export const Header: FC = () => {
  const { room } = useRoomContext();
  const { eventBus } = useGlobalContext();

  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!room) return;

    const settings = room.settings.get();
    setTitle(settings?.title ?? '');

    const unsubscribe = handleEvent(
      room.event$,
      'settingsChanged',
      ({ payload }) => {
        if (payload.title) {
          setTitle(payload.title);
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, [room]);

  const handleOpenSettings = useCallback(() => {
    eventBus({
      type: 'roomSettingsOpen',
      payload: {
        room,
      },
    });
  }, [room, eventBus]);

  return (
    <>
      <Wrapper>
        <Button
          contentLeft={<IconSettings />}
          aria-label="Settings"
          title="Settings"
          onClick={handleOpenSettings}
        />
        <Headline3>{title}</Headline3>
      </Wrapper>
    </>
  );
};
