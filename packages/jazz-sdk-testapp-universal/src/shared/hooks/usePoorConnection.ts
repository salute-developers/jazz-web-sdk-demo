import { JazzRoom } from '@salutejs/jazz-sdk-web';

import { useQuery } from './useQuery';

export function usePoorConnection(jazzRoom: JazzRoom): boolean {
  const isOnline = useQuery(jazzRoom.client.isNetworkOnline);

  const connectionStatus = useQuery(jazzRoom.connectionStatus);
  const status = useQuery(jazzRoom.status);

  return (
    !isOnline || (status === 'connected' && connectionStatus === 'connecting')
  );
}
