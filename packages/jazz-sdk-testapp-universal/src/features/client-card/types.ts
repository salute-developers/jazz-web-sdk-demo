import { FC } from 'react';

import { JazzClient, JazzRoom } from '@salutejs/jazz-sdk-web';

type RoomCardComponentProps = {
  room: JazzRoom;
};

export type ClientCardProps = {
  client: JazzClient;
  roomCardComponent: FC<RoomCardComponentProps>;
};
export type ClientCardComponent = FC<ClientCardProps>;
