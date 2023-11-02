import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
  getLobby,
  handleEvent,
  JazzRoomParticipantId,
  JazzRoomStatus,
} from '@salutejs/jazz-sdk-web';
import { Body2, Button } from '@salutejs/plasma-b2c';
import { IconDisplay } from '@salutejs/plasma-icons';
import { dark01, tertiary, white } from '@salutejs/plasma-tokens-b2c';
import { useQuery } from 'rx-effects-react';
import styled from 'styled-components/macro';

import { VideoContainer } from '../../../../shared/components/VideoContainer';
import { RoomActions } from '../../../../shared/containers/Actions';
import { GlobalMute } from '../../../../shared/containers/GlobalMute';
import { useGlobalContext } from '../../../../shared/contexts/globalContext';
import { useVideoSources } from '../../../../shared/hooks/useActiveVideoSource';
import { useParticipants } from '../../../../shared/hooks/useParticipants';
import { usePoorConnection } from '../../../../shared/hooks/usePoorConnection';
import { useVideoElement } from '../../../../shared/hooks/useVideoElement';
import { RoomCardProps } from '../../../../shared/types/roomCard';
import { booleanAttribute } from '../../../../shared/utils/dataAttributes';
import { LobbyCard } from '../LobbyCard';
import { Menu } from '../Menu';

const CustomGlobalMute = styled(GlobalMute)`
  position: absolute;
  left: 4px;
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

  > ${Body2} {
    padding: 4px;
    background: #fff;
    border-radius: 8px;
  }
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

  const [dominantParticipantId, setDominantParticipantId] = useState<
    JazzRoomParticipantId | undefined
  >();
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

  const { primary } = useVideoSources(dominantParticipantId);

  const { isVideoMuted, videoRootRef, source } =
    useVideoElement<HTMLDivElement>({
      participantId: dominantParticipantId,
      room,
      source: primary,
      height: 140,
      quality: 'medium',
    });

  const participants = useParticipants(room);

  useEffect(() => {
    if (!localParticipant) {
      return;
    }
    if (participants.length === 1) {
      setDominantParticipantId(localParticipant.id);
    } else if (participants.length === 2) {
      setDominantParticipantId(
        participants.find(
          (participant) => participant.id !== localParticipant.id,
        )?.id,
      );
    }
  }, [participants, localParticipant]);

  useEffect(() => {
    setDominantParticipantId(
      room.dominantParticipantId.get() || room.participants.get()[0]?.id,
    );

    const unsubscribeDominantParticipantId = handleEvent(
      room.event$,
      'dominantSpeakerChanged',
      ({ payload }) => {
        setDominantParticipantId(payload.id);
      },
    );

    const unsubscribeStatusChanged = handleEvent(
      room.event$,
      'statusChanged',
      ({ payload: { status } }) => {
        setStatus(status);
      },
    );

    const unsubscribeError = handleEvent(
      room.event$,
      'error',
      ({ payload: { error } }) => {
        if (error.type === 'NotAllowedError') {
          setErrorMessage('Room has unsupported feature');
          return;
        }

        if (error.type === 'AccessByPermissionError') {
          setIsShowLobby(true);
          return;
        }

        if (error.type === 'KickedError') {
          setErrorMessage('You were kicked');
          return;
        }

        if (error.type === 'ExceededMaxSdkMeetingsError') {
          setErrorMessage('Count of active rooms limit has been reached');
          return;
        }

        if (error.type === 'OpenConnectionError') {
          setErrorMessage('Connection to room has error');
          return;
        }

        if (error.type === 'NetworkError') {
          setErrorMessage('Connection to room has error');
          return;
        }

        setErrorMessage('Unknown error');
      },
    );

    return () => {
      unsubscribeStatusChanged();
      unsubscribeDominantParticipantId();
      unsubscribeError();
    };
  }, [room]);

  const dominantParticipant = participants.find(
    ({ id }) => dominantParticipantId === id,
  );
  const isLocalParticipant = localParticipant
    ? localParticipant.id === dominantParticipant?.id
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
            <Body2>Connection interrupted...</Body2>
          </ConnectionPlaceHolder>
        )}
        {status === 'connecting' && (
          <ConnectionPlaceHolder>
            <Body2>Connecting....</Body2>
          </ConnectionPlaceHolder>
        )}
        {status === 'disconnecting' && (
          <ConnectionPlaceHolder>
            <Body2>Disconnecting....</Body2>
          </ConnectionPlaceHolder>
        )}
        {status === 'error' && (
          <ConnectionPlaceHolder>
            <Body2>{errorMessage}</Body2>
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
              source === 'display' ? false : isLocalParticipant,
            )}
            data-fit="cover"
          />
          <ViewButton view="clear" onClick={() => setViewRoom(true)}>
            <StyledIconDisplay color={white} />
            View Room
          </ViewButton>
          <CustomGlobalMute room={room} />
          <Menu />
        </MainContent>
        <Actions>
          <RoomActions room={room} />
        </Actions>
      </Wrapper>

      <RoomDetailModal
        room={room}
        isOpen={viewRoom}
        onClose={() => setViewRoom(false)}
      />
      <RoomInfoModal room={room} />
      <RoomSettingsModal room={room} />
    </>
  );
};
