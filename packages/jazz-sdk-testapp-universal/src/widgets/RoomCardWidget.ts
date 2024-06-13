import { FC } from 'react';

import { JazzRoom } from '@salutejs/jazz-sdk-web';

import { RoomCard } from '../features/room-card';
import { RoomDetailModal } from '../features/room-detail-modal';
import { RoomInfoModal } from '../features/room-info';
import { RoomSettingsModal } from '../features/room-settings-modal';
import { withProps } from '../shared/utils/withProps';

export type RoomCardWidgetProps = {
  room: JazzRoom;
};

export type RoomCardWidgetComponent = FC<RoomCardWidgetProps>;

export const RoomCardWidget: RoomCardWidgetComponent = withProps(RoomCard, {
  roomDetailModalComponent: RoomDetailModal,
  roomInfoModalComponent: RoomInfoModal,
  roomSettingsModalComponent: RoomSettingsModal,
});
