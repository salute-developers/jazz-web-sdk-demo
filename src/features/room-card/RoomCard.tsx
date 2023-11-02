import { RoomCardComponent } from '../../shared/types/roomCard';

import { RoomCard as InnerComponent } from './containers/RoomCard';
import { RoomContextProvider } from './contexts/roomContext';

export const RoomCard: RoomCardComponent = (props) => {
  return (
    <RoomContextProvider room={props.room}>
      <InnerComponent {...props} />
    </RoomContextProvider>
  );
};
