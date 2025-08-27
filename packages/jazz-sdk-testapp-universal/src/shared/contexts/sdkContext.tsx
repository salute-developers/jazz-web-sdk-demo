import { createContext, FC, useContext, useMemo } from 'react';

import { JazzSdk } from '@salutejs/jazz-sdk-web';

export type SDKContext = {
  sdk: JazzSdk;
};

const SDKContext = createContext<SDKContext | undefined>(undefined);

export function useSDKContext(): SDKContext {
  const context = useContext(SDKContext);
  if (!context) {
    throw new Error('SDKContextProvider is required');
  }
  return context;
}

export const SDKContextProvider: FC<{
  sdk: JazzSdk;
  children: React.ReactNode;
}> = ({ children, sdk }) => {
  const state = useMemo(() => {
    return {
      sdk,
    };
  }, [sdk]);

  return <SDKContext.Provider value={state}>{children}</SDKContext.Provider>;
};
