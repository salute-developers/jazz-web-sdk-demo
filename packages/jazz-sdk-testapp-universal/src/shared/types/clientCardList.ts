import { FC } from 'react';

import { ClientCardWidgetComponent } from '../../widgets/ClientCardWidget';

export type ClientCardListProps = {
  clientCardComponent: ClientCardWidgetComponent;
};
export type ClientCardListComponent = FC<ClientCardListProps>;
