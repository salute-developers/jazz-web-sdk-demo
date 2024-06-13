import { FC, useCallback, useMemo } from 'react';

import { getLobby } from '@salutejs/jazz-sdk-web';
import { Badge, Button, Headline3 } from '@salutejs/plasma-b2c';
import { IconSettings } from '@salutejs/plasma-icons';
import styled from 'styled-components/macro';

import { useGlobalContext } from '../../../../shared/contexts/globalContext';
import { useQuery } from '../../../../shared/hooks/useQuery';
import { useRoomContext } from '../../contexts/roomContext';

const Wrapper = styled.div`
  width: 100%;
  height: 88px;
  display: flex;
  align-items: center;
  padding: 16px 80px 16px 16px;
  box-sizing: border-box;
  gap: 16px;
  display: grid;
  grid-template-columns: auto 1fr auto;
`;

export const Header: FC = () => {
  const { room, eventBus: featureEventBus } = useRoomContext();
  const { eventBus } = useGlobalContext();

  const title = useQuery(room.settings.title);

  const userPermissions = useQuery(room.userPermissions);

  const lobby = useMemo(() => getLobby(room), [room]);

  const isLobbyEnabled = useQuery(lobby.settings.isLobbyEnabled);

  const handleOpenSettings = useCallback(() => {
    eventBus({
      type: 'roomSettingsOpen',
      payload: {
        room,
      },
    });
  }, [room, eventBus]);

  const handleOpenLobby = useCallback(() => {
    featureEventBus({
      type: 'openLobbyModal',
    });
  }, [featureEventBus]);

  const lobbyParticipants = useQuery(lobby.participants);

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
        {isLobbyEnabled && userPermissions.canManageLobby && (
          <Button
            contentRight={
              <Badge size="l" text={`${lobbyParticipants.length}`} />
            }
            aria-label="Lobby"
            title="Lobby"
            onClick={handleOpenLobby}
            text="Lobby"
          />
        )}
      </Wrapper>
    </>
  );
};
