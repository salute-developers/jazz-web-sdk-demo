import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getLocalDevices,
  handleEvent,
  JazzRoom,
  JazzSdkCreateAnonymousRoomDetails,
  JazzSdkCreateConferenceDetails,
} from '@salutejs/jazz-sdk-web';
import { Body2, Button } from '@salutejs/plasma-b2c';
import { IconPlus } from '@salutejs/plasma-icons';
import { tertiary, white } from '@salutejs/plasma-tokens';
import uniqueId from 'lodash/uniqueId';
import styled from 'styled-components/macro';

import { useGlobalContext } from '../../shared/contexts/globalContext';
import { ClientCardComponent } from '../../shared/types/clientCard';

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

export const ClientCard: ClientCardComponent = ({
  client,
  roomCardComponent: RoomCard,
}) => {
  const { eventBus } = useGlobalContext();

  const sdk = client.sdk;

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

  const localDevices = useMemo(() => {
    return getLocalDevices(sdk);
  }, [sdk]);

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
          conferenceId: form.roomId,
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

      const room = client.conferences.join({
        conferenceId: form.roomId,
        password: form.password,
      });

      console.log('Connecting to room', room);

      try {
        const [audioStream, videoStream] = await Promise.all([
          localDevices.getSelectedAudioInputStream(),
          localDevices.getSelectedVideoInputStream(),
        ]);

        console.log('Add mediaStreams to room');

        room.setUserAudioInput(audioStream);
        room.setUserVideoInput(videoStream);

        const releaseMedia = () => {
          console.log('Release mediaStreams');

          localDevices.releaseMediaStream(audioStream);
          localDevices.releaseMediaStream(videoStream);

          const displayStream = room.displayStream.get();

          if (displayStream) {
            localDevices.releaseMediaStream(displayStream);
          }
        };

        handleEvent(room.event$, 'destroy', releaseMedia, true);
      } catch (error) {
        console.log('Media permission denied');
      }
    },
    [client, localDevices, handleCloseJoinToConferenceModal, eventBus],
  );

  const handleCreateConference = useCallback(
    (form: CreateConferenceForm) => {
      handleCloseCreateConferenceModal();

      client.conferences
        .createConference({
          title: form.conferenceName,
          isLobbyEnabled: form.isLobbyEnabled,
          isGuestEnabled: form.isGuestEnabled,
        })
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
    if (!client.auth.isAuthorised.get()) {
      eventBus({
        type: 'error',
        payload: {
          title: 'To create the conference, you need to sign in',
        },
      });
      return;
    }
    setIsOpenCreateConferenceModal(true);
  }, [client, eventBus]);

  const handleJoin = useCallback(() => {
    if (!client.auth.isAuthorised.get()) {
      eventBus({
        type: 'error',
        payload: {
          title: 'To join the conference, you need to sign in',
        },
      });
      return;
    }
    setIsOpenJoinToConferenceModal(true);
  }, [eventBus, client]);

  return (
    <Wrapper>
      <TitleWrapper>
        <Body2>JazzClient: {client.serverUrl}</Body2>
        <RoomActions>
          <UserProfile client={client} />
          <Button onClick={client.destroy}>Remove</Button>
        </RoomActions>
      </TitleWrapper>
      <Content>
        {rooms.map((room) => (
          <RoomCard key={room.key} room={room.room} />
        ))}
        <AddConferenceWrapper>
          <CreateConferenceAction view="primary" onClick={handleCreate}>
            <IconPlus color={white} />
            Create a video meeting
          </CreateConferenceAction>
          <Button onClick={handleJoin}>Join the meeting</Button>
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
