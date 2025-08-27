import { FC, memo } from 'react';

import { JazzClient } from '@salutejs/jazz-sdk-web';

import { ClientCard } from '../features/client-card';
import { ClientContextProvider } from '../shared/contexts/clientContext';

import { RoomCardWidget } from './RoomCardWidget';

export type ClientCardWidgetProps = {
  client: JazzClient;
};

export const ClientCardWidget: FC<ClientCardWidgetProps> = memo(
  ({ client }) => {
    return (
      <ClientContextProvider client={client}>
        <ClientCard client={client} roomCardComponent={RoomCardWidget} />
      </ClientContextProvider>
    );
  },
);
