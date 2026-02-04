import { FC, useCallback, useMemo } from 'react';

import { getLobby } from '@salutejs/jazz-sdk-web';
import { Badge, Button, Headline3, IconButton } from '@salutejs/plasma-b2c';
import { IconClose, IconSettings } from '@salutejs/plasma-icons';
import styled from 'styled-components/macro';

import { MenuArea } from '../../../../shared/containers/MenuArea';
import { useGlobalContext } from '../../../../shared/contexts/globalContext';
import { useQuery } from '../../../../shared/hooks/useQuery';
import { useRoomContext } from '../../contexts/roomContext';

const Wrapper = styled.div`
  width: 100%;
  height: 88px;
  display: flex;
  align-items: center;
  grid-auto-columns: auto;
  grid-auto-flow: column;
  grid-template-columns: auto 1fr auto;
  padding: 16px 16px 16px 16px;
  box-sizing: border-box;
  gap: 16px;
  display: grid;

  & > *:nth-child(n + 3) {
    grid-column: auto;
  }
`;

const CustomHeadline3 = styled(Headline3)`
  width: 100%;
`;

export const Header: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { room, eventBus: featureEventBus } = useRoomContext();
  const { eventBus } = useGlobalContext();

  const title = useQuery(room.settings.title);

  const userPermissions = useQuery(room.userPermissions);

  const lobby = useMemo(() => {
    return getLobby(room);
  }, [room]);

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
          view="secondary"
          aria-label="Settings"
          title="Settings"
          onClick={handleOpenSettings}
        >
          <IconSettings />
        </Button>

        <CustomHeadline3>{title}</CustomHeadline3>
        <MenuArea menuName="RoomFeatures" />
        {isLobbyEnabled && userPermissions.canManageLobby && (
          <Button
            contentRight={
              <Badge size="l" text={`${lobbyParticipants.length}`} />
            }
            view="secondary"
            aria-label="Lobby"
            title="Lobby"
            onClick={handleOpenLobby}
            text="Lobby"
          />
        )}

        <IconButton onClick={onClose} view="clear">
          <IconClose />
        </IconButton>
      </Wrapper>
    </>
  );
};
