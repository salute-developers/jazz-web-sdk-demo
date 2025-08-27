import { FC } from 'react';

import { RoomSettingsModal as InnerComponent } from './containers/RoomSettingsModal';
import { RoomContextProvider } from './contexts/roomContext';
import { RoomSettingsModalProps } from './types';

export const RoomSettingsModal: FC<RoomSettingsModalProps> = (props) => {
  return (
    <RoomContextProvider room={props.room}>
      <InnerComponent />
    </RoomContextProvider>
  );
};
