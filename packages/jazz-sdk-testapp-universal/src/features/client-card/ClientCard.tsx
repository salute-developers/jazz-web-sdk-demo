import { FC, useCallback, useEffect, useState } from 'react';

import {
  getJazzSdk,
  getLocalDevices,
  handleEvent,
  JazzRoom,
  JazzSdkCreateAnonymousRoomDetails,
  JazzSdkCreateConferenceDetails,
  withAnonymousCreateRoom,
  withAnonymousJoin,
} from '@salutejs/jazz-sdk-web';
import { getVideoEffectsService } from '@salutejs/jazz-sdk-web-plugins';
import { Body2, Button } from '@salutejs/plasma-b2c';
import { IconPlus } from '@salutejs/plasma-icons';
import {
  textTertiary as tertiary,
  onDarkTextPrimary as white,
} from '@salutejs/plasma-themes/tokens';
import uniqueId from 'lodash/uniqueId';
import styled from 'styled-components/macro';

import { useGlobalContext } from '../../shared/contexts/globalContext';

import { ConferenceInfoModal } from './containers/ConferenceInfoModal';
import {
  CreateConferenceForm,
  CreateConferenceModal,
} from './containers/CreateConferenceModal';
import {
  JoinToConferenceModal,
  JoinToConferenceModalForm,
} from './containers/JoinToConferenceModal';
import { UserProfile } from './containers/UserProfile';
import { ClientCardProps } from './types';

const Wrapper = styled.div`
  margin-bottom: 16px;
  border-bottom: 1px solid ${tertiary};
`;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const RoomActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Content = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 16px;
`;

const AddConferenceWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 220px;
`;

const CreateConferenceAction = styled(Button)`
  height: 150px;

  > span {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
  }
`;

export const ClientCard: FC<ClientCardProps> = ({
  client,
  roomCardComponent: RoomCard,
}) => {
  const { eventBus } = useGlobalContext();

  const [rooms, setRooms] = useState<{ key: string; room: JazzRoom }[]>([]);

  const [isOpenCreateConferenceModal, setIsOpenCreateConferenceModal] =
    useState(false);

  const [isOpenJoinToConferenceModal, setIsOpenJoinToConferenceModal] =
    useState(false);
  const [roomDetails, setRoomDetails] = useState<
    | JazzSdkCreateAnonymousRoomDetails
    | JazzSdkCreateConferenceDetails
    | undefined
  >(undefined);

  const sdk = getJazzSdk(client);

  const localDevices = getLocalDevices(sdk);

  const videoEffectService = getVideoEffectsService(sdk);

  useEffect(() => {
    const unsubscribeAddRoom = handleEvent(
      client.event$,
      'addRoom',
      async ({ payload }) => {
        setRooms((rooms) => [
          ...rooms,
          { key: uniqueId(), room: payload.room },
        ]);
      },
    );

    const unsubscribeRemoveRoom = handleEvent(
      client.event$,
      'removeRoom',
      ({ payload }) => {
        setRooms((rooms) => rooms.filter((room) => room.room !== payload.room));
      },
    );

    return () => {
      unsubscribeAddRoom();
      unsubscribeRemoveRoom();
    };
  }, [client]);

  const handleCloseCreateConferenceModal = useCallback(() => {
    setIsOpenCreateConferenceModal(false);
  }, []);

  const handleCloseJoinToConferenceModal = useCallback(() => {
    setIsOpenJoinToConferenceModal(false);
  }, []);

  const handleConnectToConference = useCallback(
    async (form: JoinToConferenceModalForm) => {
      handleCloseJoinToConferenceModal();

      try {
        await client.conferences.getDetails({
          roomId: form.roomId,
          password: form.password,
        });
      } catch (error) {
        eventBus({
          type: 'error',
          payload: {
            title: 'Fail connect to conference',
          },
        });
        return;
      }

      const room = client.conferences.join(
        {
          roomId: form.roomId,
          password: form.password,
        },
        !client.auth.isAuthorised.get() &&
          withAnonymousJoin({ userName: form.userName }),
      );

      console.log('Connecting to room', room);

      const releaseMedia = () => {
        const displayStream = room.displayStream.get();

        if (displayStream) {
          console.log('Release display mediaStream');

          localDevices.releaseMediaStream(displayStream);
        }
      };

      handleEvent(room.event$, 'destroy', releaseMedia, true);

      const audioInit = async () => {
        try {
          const audioStream = await localDevices.getSelectedAudioInputStream();

          console.log('Add audio mediaStream to room');

          room.setUserAudioInput(audioStream);

          const releaseMedia = () => {
            console.log('Release audio mediaStream');

            localDevices.releaseMediaStream(audioStream);
          };

          handleEvent(room.event$, 'destroy', releaseMedia, true);
        } catch (error) {
          console.log('Media permission for audio is denied');
        }
      };

      const videoInit = async () => {
        try {
          const videoStream = await localDevices.getSelectedVideoInputStream();

          console.log('Add video mediaStream to room');

          room.setUserVideoInput(videoStream);
          videoEffectService.setMediaStream(videoStream);

          const releaseMedia = () => {
            console.log('Release video mediaStream');

            localDevices.releaseMediaStream(videoStream);
          };

          handleEvent(room.event$, 'destroy', releaseMedia, true);
        } catch (error) {
          console.log('Media permission for video is denied');
        }
      };

      await Promise.all([audioInit(), videoInit()]);
    },
    [
      client,
      localDevices,
      handleCloseJoinToConferenceModal,
      eventBus,
      videoEffectService,
    ],
  );

  const handleCreateConference = useCallback(
    (form: CreateConferenceForm) => {
      handleCloseCreateConferenceModal();

      client.conferences
        .createRoom(
          {
            title: form.conferenceName,
            isLobbyEnabled: form.isLobbyEnabled,
            isGuestEnabled: form.isGuestEnabled,
            jazzNextOnly: form.jazzNextOnly,
          },
          !client.auth.isAuthorised.get() && withAnonymousCreateRoom(),
        )
        .then((data) => {
          console.log('Create conference', data);
          if (!form.connectToConference) {
            setRoomDetails(data);
            return;
          }

          const { id, password } = data;

          handleConnectToConference({
            roomId: id,
            password,
            userName: form.userName,
          });
        })
        .catch((error) => {
          console.error(error);
          eventBus({
            type: 'error',
            payload: { title: 'Fail create conference' },
          });
        });
    },
    [
      client,
      eventBus,
      handleConnectToConference,
      handleCloseCreateConferenceModal,
    ],
  );

  const handleCreate = useCallback(() => {
    setIsOpenCreateConferenceModal(true);
  }, []);

  const handleJoin = useCallback(() => {
    setIsOpenJoinToConferenceModal(true);
  }, []);

  return (
    <Wrapper>
      <TitleWrapper>
        <Body2>JazzClient: {client.serverUrl}</Body2>
        <RoomActions>
          <UserProfile client={client} />
          <Button view="secondary" onClick={client.destroy}>
            Remove
          </Button>
        </RoomActions>
      </TitleWrapper>
      <Content>
        {rooms.map((room) => (
          <RoomCard key={room.key} room={room.room} />
        ))}
        <AddConferenceWrapper>
          <CreateConferenceAction
            stretch
            view="accent"
            onClick={handleCreate}
            contentLeft={<IconPlus color={white} />}
          >
            Create meeting
          </CreateConferenceAction>
          <Button view="secondary" stretch onClick={handleJoin}>
            Join meeting
          </Button>
        </AddConferenceWrapper>
      </Content>

      <ConferenceInfoModal
        roomDetails={roomDetails}
        onClose={() => setRoomDetails(undefined)}
      />

      <CreateConferenceModal
        isOpen={isOpenCreateConferenceModal}
        client={client}
        onClose={handleCloseCreateConferenceModal}
        onCreate={handleCreateConference}
      />

      <JoinToConferenceModal
        isOpen={isOpenJoinToConferenceModal}
        client={client}
        onClose={handleCloseJoinToConferenceModal}
        onJoin={handleConnectToConference}
      />
    </Wrapper>
  );
};
