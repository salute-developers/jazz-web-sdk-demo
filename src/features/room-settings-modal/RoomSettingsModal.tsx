import { RoomSettingsModalComponent } from '../../shared/types/roomSettingsModal';

import { RoomSettingsModal as InnerComponent } from './containers/RoomSettingsModal';
import { RoomContextProvider } from './contexts/roomContext';

export const RoomSettingsModal: RoomSettingsModalComponent = (props) => {
  return (
    <RoomContextProvider room={props.room}>
      <InnerComponent {...props} />
    </RoomContextProvider>
  );
};
