import { RoomDetailModalComponent } from '../../shared/types/roomDetailModal';

import { RoomModal as InnerComponent } from './containers/RoomModal';
import { RoomContextProvider } from './contexts/roomContext';

export const RoomDetailModal: RoomDetailModalComponent = (props) => {
  return (
    <RoomContextProvider room={props.room}>
      <InnerComponent {...props} />
    </RoomContextProvider>
  );
};
