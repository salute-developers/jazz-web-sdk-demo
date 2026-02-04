import { FC } from 'react';

import { JazzRoom } from '@salutejs/jazz-sdk-web';

import { LobbyModalController } from './containers/LobbyModalController';
import { ParticipantInfoModalController } from './containers/ParticipantInfoModalController';
import { RoomModal as InnerComponent } from './containers/RoomModal';
import { RoomContextProvider } from './contexts/roomContext';
type RoomDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  room: JazzRoom;
};
export const RoomDetailModal: FC<RoomDetailModalProps> = (props) => {
  return (
    <RoomContextProvider room={props.room}>
      <InnerComponent {...props} />
      <LobbyModalController />
      <ParticipantInfoModalController />
    </RoomContextProvider>
  );
};
