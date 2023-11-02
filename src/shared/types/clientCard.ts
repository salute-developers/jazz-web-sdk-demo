import { FC } from 'react';

import { JazzClient } from '@salutejs/jazz-sdk-web';

import { RoomCardWidgetComponent } from '../../widgets/RoomCardWidget';

export type ClientCardProps = {
  client: JazzClient;
  roomCardComponent: RoomCardWidgetComponent;
};
export type ClientCardComponent = FC<ClientCardProps>;
