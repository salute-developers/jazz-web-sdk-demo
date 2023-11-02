import { FC } from 'react';

import { JazzRoom } from '@salutejs/jazz-sdk-web';

export type RoomInfoModalProps = {
  room: JazzRoom;
};
export type RoomInfoModalComponent = FC<RoomInfoModalProps>;
