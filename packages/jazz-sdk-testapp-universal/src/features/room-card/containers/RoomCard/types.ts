import { FC } from 'react';

import { JazzRoom } from '@salutejs/jazz-sdk-web';

export type RoomCardProps = {
  room: JazzRoom;
  roomDetailModalComponent: FC<{ isOpen: boolean; onClose: () => void }>;
  roomInfoModalComponent: FC;
  roomSettingsModalComponent: FC;
};
