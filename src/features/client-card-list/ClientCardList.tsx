import { useEffect, useState } from 'react';

import { handleEvent, JazzClient } from '@salutejs/jazz-sdk-web';
import uniqueId from 'lodash/uniqueId';

import { useGlobalContext } from '../../shared/contexts/globalContext';
import { ClientCardListComponent } from '../../shared/types/clientCardList';

import { NewClientForm } from './containers/NewClientForm';

export const ClientCardList: ClientCardListComponent = ({
  clientCardComponent: ClientCard,
}) => {
  const { sdk, eventBus } = useGlobalContext();

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
      },
    );

    const unsubscribeRemoveClient = handleEvent(
      sdk.event$,
      'removeClient',
      ({ payload: { client } }) => {
        setClients((clients) =>
          clients.filter((item) => item.client !== client),
        );
      },
    );

    return () => {
      unsubscribeAddClient();
      unsubscribeRemoveClient();
    };
  }, [sdk, eventBus]);

  return (
    <div>
      {clients.map((client) => (
        <ClientCard key={client.key} client={client.client} />
      ))}
      <NewClientForm />
    </div>
  );
};
