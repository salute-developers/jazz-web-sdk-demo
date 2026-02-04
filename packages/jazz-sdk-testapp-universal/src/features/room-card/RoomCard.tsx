import { FC } from 'react';

import { SlotArea } from '../../shared/containers/SlotArea';

import { RoomCard as InnerComponent } from './containers/RoomCard';
import { RoomCardProps } from './containers/RoomCard/types';
import { RoomContextProvider } from './contexts/roomContext';

export const RoomCard: FC<RoomCardProps> = (props) => {
  return (
    <RoomContextProvider room={props.room}>
      <InnerComponent {...props} />
      <SlotArea slotName="RoomPanel" />
    </RoomContextProvider>
  );
};
