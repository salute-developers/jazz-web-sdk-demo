import { FC } from 'react';

import { JazzRoom } from '@salutejs/jazz-sdk-web';

import { RoomDetailModalComponent } from './roomDetailModal';
import { RoomInfoModalComponent } from './roomInfoModal';
import { RoomSettingsModalComponent } from './roomSettingsModal';

export type RoomCardProps = {
  room: JazzRoom;
  roomDetailModalComponent: RoomDetailModalComponent;
  roomInfoModalComponent: RoomInfoModalComponent;
  roomSettingsModalComponent: RoomSettingsModalComponent;
};

export type RoomCardComponent = FC<RoomCardProps>;
