import { createContext, FC, useContext, useMemo } from 'react';

import { JazzClient } from '@salutejs/jazz-sdk-web';

export type ClientContext = {
  client: JazzClient;
};

const ClientContext = createContext<ClientContext | undefined>(undefined);

export function useClientContext(): ClientContext {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('ClientContext is required');
  }
  return context;
}

export const ClientContextProvider: FC<{
  client: JazzClient;
  children: React.ReactNode;
}> = ({ children, client }) => {
  const state = useMemo(() => {
    return {
      client,
    };
  }, [client]);

  return (
    <ClientContext.Provider value={state}>{children}</ClientContext.Provider>
  );
};
