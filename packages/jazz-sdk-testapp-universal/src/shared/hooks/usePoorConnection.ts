import { useEffect, useState } from 'react';

import { JazzRoom } from '@salutejs/jazz-sdk-web';

import { useQuery } from './useQuery';

export function usePoorConnection(jazzRoom: JazzRoom): boolean {
  const isOnline = useNetworkOnline();

  const connectionStatus = useQuery(jazzRoom.connectionStatus);
  const status = useQuery(jazzRoom.status);

  return (
    !isOnline || (status === 'connected' && connectionStatus === 'connecting')
  );
}

export const useNetworkOnline = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    let throttleTimeout: ReturnType<typeof setTimeout> | null = null;

    const updateOnlineStatus = () => {
      if (throttleTimeout === null) {
        setIsOnline(navigator.onLine);
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 500);
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, []);

  return isOnline;
};
