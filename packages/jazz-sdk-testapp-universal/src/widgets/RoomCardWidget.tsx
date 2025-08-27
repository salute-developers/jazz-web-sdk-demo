import { FC, memo } from 'react';

import { JazzRoom } from '@salutejs/jazz-sdk-web';

import { RoomCard } from '../features/room-card';
import { RoomDetailModal } from '../features/room-detail-modal';
import { RoomInfoModal } from '../features/room-info';
import { RoomSettingsModal } from '../features/room-settings-modal';
import { RoomContextProvider } from '../shared/contexts/roomContext';

export type RoomCardWidgetProps = {
  room: JazzRoom;
};

export const RoomCardWidget: FC<RoomCardWidgetProps> = memo(({ room }) => {
  return (
    <RoomContextProvider room={room}>
      <RoomCard
        room={room}
        roomDetailModalComponent={({ ...params }) => (
          <RoomDetailModal {...params} room={room} />
        )}
        roomInfoModalComponent={() => <RoomInfoModal room={room} />}
        roomSettingsModalComponent={() => <RoomSettingsModal room={room} />}
      />
    </RoomContextProvider>
  );
});
