import { JazzRoom } from '@salutejs/jazz-sdk-web';
import { useQuery } from 'rx-effects-react';

export function usePoorConnection(jazzRoom: JazzRoom): boolean {
  const isOnline = useQuery(jazzRoom.client.isNetworkOnline);

  const connectionStatus = useQuery(jazzRoom.connectionStatus);

  return !isOnline || connectionStatus === 'interrupted';
}
