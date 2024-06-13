import { RoomCardComponent } from '../../shared/types/roomCard';

import { RoomCard as InnerComponent } from './containers/RoomCard';
import { RoomContextProvider } from './contexts/roomContext';

export const RoomCard: RoomCardComponent = (props) => (
    <RoomContextProvider room={props.room}>
      <InnerComponent {...props} />
    </RoomContextProvider>
  );
