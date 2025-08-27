import { FC, useEffect, useState } from 'react';

import { handleEvent, JazzClient } from '@salutejs/jazz-sdk-web';
import uniqueId from 'lodash/uniqueId';

import { useClientsContext } from '../../shared/contexts/clientsContext';
import { useSDKContext } from '../../shared/contexts/sdkContext';

import { NewClientForm } from './containers/NewClientForm';
import { ClientCardListProps } from './types';

export const ClientCardList: FC<ClientCardListProps> = ({
  clientCardComponent: ClientCard,
}) => {
  const { addClient, removeClient } = useClientsContext();
  const { sdk } = useSDKContext();

  const [clients, setClients] = useState<{ key: string; client: JazzClient }[]>(
    [],
  );

  useEffect(() => {
    if (!sdk) return;

    const unsubscribeAddClient = handleEvent(
      sdk.event$,
      'addClient',
      ({ payload: { client } }) => {
        setClients((clients) => [...clients, { key: uniqueId(), client }]);
        addClient(client);
      },
    );

    const unsubscribeRemoveClient = handleEvent(
      sdk.event$,
      'removeClient',
      ({ payload: { client } }) => {
        setClients((clients) =>
          clients.filter((item) => item.client !== client),
        );
        removeClient(client);
      },
    );

    return () => {
      unsubscribeAddClient();
      unsubscribeRemoveClient();
    };
  }, [sdk, removeClient, addClient]);

  return (
    <div>
      {clients.map((client) => (
        <ClientCard key={client.key} client={client.client} />
      ))}
      <NewClientForm />
    </div>
  );
};
