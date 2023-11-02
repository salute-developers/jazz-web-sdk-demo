import { FC } from 'react';

import { JazzRoom } from '@salutejs/jazz-sdk-web';

export type RoomDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  room: JazzRoom;
};

export type RoomDetailModalComponent = FC<RoomDetailModalProps>;
