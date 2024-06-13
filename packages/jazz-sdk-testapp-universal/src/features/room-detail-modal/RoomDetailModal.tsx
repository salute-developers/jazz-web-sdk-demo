import { RoomDetailModalComponent } from '../../shared/types/roomDetailModal';

import { LobbyModalController } from './containers/LobbyModalController';
import { RoomModal as InnerComponent } from './containers/RoomModal';
import { RoomContextProvider } from './contexts/roomContext';

export const RoomDetailModal: RoomDetailModalComponent = (props) => (
    <RoomContextProvider room={props.room}>
      <InnerComponent {...props} />
      <LobbyModalController />
    </RoomContextProvider>
  );
