import { useEffect, useState } from 'react';

import { handleEvent, JazzClient } from '@salutejs/jazz-sdk-web';
import uniqueId from 'lodash/uniqueId';

import { useClientsContext } from '../../shared/contexts/clientsContext';
import { useGlobalContext } from '../../shared/contexts/globalContext';
import { ClientCardListComponent } from '../../shared/types/clientCardList';

import { NewClientForm } from './containers/NewClientForm';

export const ClientCardList: ClientCardListComponent = ({
  clientCardComponent: ClientCard,
}) => {
  const { sdk, eventBus } = useGlobalContext();
  const { addClient, removeClient } = useClientsContext();

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
  }, [sdk, eventBus, removeClient, addClient]);

  return (
    <div>
      {clients.map((client) => (
        <ClientCard key={client.key} client={client.client} />
      ))}
      <NewClientForm />
    </div>
  );
};
