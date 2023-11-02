import { FC } from 'react';

import { JazzRoom } from '@salutejs/jazz-sdk-web';

export type RoomSettingsModalProps = {
  room: JazzRoom;
};
export type RoomSettingsModalComponent = FC<RoomSettingsModalProps>;
