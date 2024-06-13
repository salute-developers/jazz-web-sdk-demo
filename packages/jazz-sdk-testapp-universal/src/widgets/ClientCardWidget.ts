import { FC } from 'react';

import { JazzClient } from '@salutejs/jazz-sdk-web';

import { ClientCard } from '../features/client-card';
import { withProps } from '../shared/utils/withProps';

import { RoomCardWidget } from './RoomCardWidget';

export type ClientCardWidgetProps = {
  client: JazzClient;
};

export type ClientCardWidgetComponent = FC<ClientCardWidgetProps>;

export const ClientCardWidget: ClientCardWidgetComponent = withProps(
  ClientCard,
  {
    roomCardComponent: RoomCardWidget,
  },
);
