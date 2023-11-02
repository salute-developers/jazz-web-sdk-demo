import { FC } from 'react';

import { ClientCardList } from '../features/client-card-list';
import { withProps } from '../shared/utils/withProps';

import { ClientCardWidget } from './ClientCardWidget';

export type ClientCardListWidgetProps = unknown;

export type ClientCardListWidgetComponent = FC<ClientCardListWidgetProps>;

export const ClientCardListWidget: ClientCardListWidgetComponent = withProps(
  ClientCardList,
  {
    clientCardComponent: ClientCardWidget,
  },
);
