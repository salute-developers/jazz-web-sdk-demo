import { createContext, FC, useContext, useState } from 'react';

import { JazzClient } from '@salutejs/jazz-sdk-web';
import { BehaviorSubject, Observable } from 'rxjs';

type SdkTokenState = {
  value: string;
  iss: string;
  userName: string;
  sub: string;
};

type ClientState = {
  sdkTokenState?: SdkTokenState;
};

type ClientsContext = {
  clients$: Observable<Map<JazzClient, ClientState>>;
  addClient: (client: JazzClient) => void;
  removeClient: (client: JazzClient) => void;
  loginBySdkToken: (client: JazzClient, state: SdkTokenState) => void;
};

function getInitialState(): ClientsContext {
  const clients$ = new BehaviorSubject(new Map<JazzClient, ClientState>());
  return {
    clients$,
    addClient: (client) => {
      const newClients = new Map(clients$.value);
      newClients.set(client, {});
      clients$.next(newClients);
    },
    loginBySdkToken: (client, state) => {
      const newClients = new Map(clients$.value);
      newClients.set(client, {
        ...newClients.get(client),
        sdkTokenState: state,
      });
      clients$.next(newClients);
    },
    removeClient: (client) => {
      const newClients = new Map(clients$.value);
      newClients.delete(client);
      clients$.next(newClients);
    },
  };
}

const clientsContext = createContext<ClientsContext | undefined>(undefined);

export function useClientsContext(): ClientsContext {
  const result = useContext(clientsContext);

  if (!result) {
    throw new Error('ClientsContext is required');
  }

  return result;
}

export const ClientsContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state] = useState<ClientsContext>(getInitialState);

  return (
    <clientsContext.Provider value={state}>{children}</clientsContext.Provider>
  );
};
