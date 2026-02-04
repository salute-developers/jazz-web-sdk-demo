import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { getLobby, handleEvent, JazzRoomStatus } from '@salutejs/jazz-sdk-web';
import { Body2, Button } from '@salutejs/plasma-b2c';
import { IconDisplay } from '@salutejs/plasma-icons';
import {
  onDarkSurfaceSolidPrimary as dark01,
  textTertiary as tertiary,
  onDarkTextPrimary as white,
} from '@salutejs/plasma-themes/tokens';
import styled from 'styled-components/macro';

import { VideoContainer } from '../../../../shared/components/VideoContainer';
import { RoomActions } from '../../../../shared/containers/Actions';
import { GlobalMute } from '../../../../shared/containers/GlobalMute';
import { useGlobalContext } from '../../../../shared/contexts/globalContext';
import { useVideoSources } from '../../../../shared/hooks/useActiveVideoSource';
import { useParticipants } from '../../../../shared/hooks/useParticipants';
import { usePoorConnection } from '../../../../shared/hooks/usePoorConnection';
import { useQuery } from '../../../../shared/hooks/useQuery';
import { useVideoElement } from '../../../../shared/hooks/useVideoElement';
import { booleanAttribute } from '../../../../shared/utils/dataAttributes';
import { LobbyCard } from '../LobbyCard';
import { Menu } from '../Menu';

import { RoomCardProps } from './types';

const CustomGlobalMute = styled(GlobalMute)`
  position: absolute;
  left: 4px;
  top: 4px;
  z-index: 2;
`;

const MenuContainer = styled.div`
  position: absolute;
  right: 4px;
  top: 4px;
  z-index: 2;
`;

const Wrapper = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
`;

const ConnectionPlaceHolder = styled.div`
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 4px;
`;

const Body = styled(Body2)`
  padding: 4px;
  background: #fff;
  border-radius: 8px;
`;

const StyledIconDisplay = styled(IconDisplay)`
  margin-right: 8px;
`;

const MainContent = styled.div`
  height: 140px;
  width: 100%;
  position: relative;
  background: ${dark01};
`;

const ViewButton = styled(Button)`
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  color: ${white};

  &:hover {
    color: ${white};
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${tertiary};
  padding: 8px 0;
`;

export const RoomCard: FC<RoomCardProps> = ({
  room,
  roomDetailModalComponent: RoomDetailModal,
  roomInfoModalComponent: RoomInfoModal,
  roomSettingsModalComponent: RoomSettingsModal,
}) => {
  const [viewRoom, setViewRoom] = useState(false);

  const { eventBus } = useGlobalContext();

  const localParticipant = useQuery(room.localParticipant);

  const [status, setStatus] = useState<JazzRoomStatus>(() => room.status.get());

  const [errorMessage, setErrorMessage] = useState('');

  const [isShowLobby, setIsShowLobby] = useState(false);

  const lobby = useMemo(() => getLobby(room), [room]);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    eventBus({
      type: 'error',
      payload: {
        title: errorMessage,
      },
    });
  }, [errorMessage, eventBus]);

  const participants = useParticipants(room);

  const visibleParticipantId = participants[0]?.id;

  const { primary } = useVideoSources(visibleParticipantId);

  const { isVideoMuted, videoRootRef, source } =
    useVideoElement<HTMLDivElement>({
      participantId: visibleParticipantId,
      room,
      source: primary === 'display' ? 'displayScreen' : 'video',
    });

  useEffect(() => {
    const unsubscribeStatusChanged = handleEvent(
      room.event$,
      'statusChanged',
      ({ payload: { status } }) => {
        setStatus(status);
      },
    );

    const unsubscribeKicked = handleEvent(
      room.event$,
      'kicked',
      ({ payload: { reason } }) => {
        if (reason === 'callEnded') {
          eventBus({
            type: 'error',
            payload: {
              title: 'Call ended',
            },
          });
          return;
        }
        if (reason === 'kicked') {
          eventBus({
            type: 'error',
            payload: {
              title: 'You were kicked',
            },
          });
        }
      },
    );

    const unsubscribeError = handleEvent(
      room.event$,
      'error',
      ({ payload: { error } }) => {
        if (error.type === 'notAllowed') {
          setErrorMessage('Room has unsupported feature');
          setViewRoom(false);
          return;
        }

        if (error.type === 'accessByPermission') {
          setIsShowLobby(true);
          return;
        }

        if (error.type === 'MAX_MEETING_COUNT_EXCEEDED') {
          setErrorMessage('Count of active rooms limit has been reached');
          setViewRoom(false);
          return;
        }

        if (error.type === 'openConnection') {
          setErrorMessage('Connection to room has error');
          setViewRoom(false);
          return;
        }

        if (error.type === 'network') {
          setErrorMessage('Connection to room has error');
          setViewRoom(false);
          return;
        }

        setViewRoom(false);
        setErrorMessage('Unknown error');
      },
    );

    return () => {
      unsubscribeStatusChanged();
      unsubscribeError();
      unsubscribeKicked();
    };
  }, [room, eventBus]);

  const visibleParticipant = participants.find(
    ({ id }) => visibleParticipantId === id,
  );
  const isLocalParticipant = localParticipant
    ? localParticipant.id === visibleParticipant?.id
    : false;

  const handleHideLobby = useCallback(() => {
    setIsShowLobby(false);
  }, []);

  const poorConnection = usePoorConnection(room);

  if (isShowLobby) {
    return <LobbyCard room={room} lobby={lobby} onHide={handleHideLobby} />;
  }

  return (
    <>
      <Wrapper>
        {poorConnection && (
          <ConnectionPlaceHolder>
            <Body>Connection interrupted...</Body>
          </ConnectionPlaceHolder>
        )}
        {status === 'connecting' && (
          <ConnectionPlaceHolder>
            <Body>Connecting....</Body>
          </ConnectionPlaceHolder>
        )}
        {status === 'disconnecting' && (
          <ConnectionPlaceHolder>
            <Body>Disconnecting....</Body>
          </ConnectionPlaceHolder>
        )}
        {status === 'error' && (
          <ConnectionPlaceHolder>
            <Body>{errorMessage}</Body>
            <Button view="critical" onClick={() => room.leave()}>
              Remove
            </Button>
          </ConnectionPlaceHolder>
        )}
        <MainContent>
          <VideoContainer
            ref={videoRootRef}
            data-paused={booleanAttribute(isVideoMuted)}
            data-is-invert={booleanAttribute(
              source === 'displayScreen' ? false : isLocalParticipant,
            )}
            data-fit="cover"
          />
          <ViewButton
            stretching="filled"
            view="clear"
            onClick={() => setViewRoom(true)}
          >
            <StyledIconDisplay color={white} />
            View Room
          </ViewButton>
          <CustomGlobalMute room={room} />
          <MenuContainer>
            <Menu />
          </MenuContainer>
        </MainContent>
        <Actions>
          <RoomActions room={room} />
        </Actions>
      </Wrapper>

      <RoomDetailModal isOpen={viewRoom} onClose={() => setViewRoom(false)} />
      <RoomInfoModal />
      <RoomSettingsModal />
    </>
  );
};
