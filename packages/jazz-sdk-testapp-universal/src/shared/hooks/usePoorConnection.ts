import { getJazzClient, JazzRoom } from '@salutejs/jazz-sdk-web';

import { useQuery } from './useQuery';

export function usePoorConnection(jazzRoom: JazzRoom): boolean {
  const client = getJazzClient(jazzRoom);
  const isOnline = useQuery(client.isNetworkOnline);

  const connectionStatus = useQuery(jazzRoom.connectionStatus);
  const status = useQuery(jazzRoom.status);

  return (
    !isOnline || (status === 'connected' && connectionStatus === 'connecting')
  );
}
