import { useEffect, useState } from 'react';

import { handleQuery, Query } from '@salutejs/jazz-sdk-web';

export function useQuery<T>(query: Query<T>): T {
  const [state, setState] = useState<T>(() => query.get());

  useEffect(() => {
    return handleQuery(query, (state) => {
      setState(state);
    });
  }, [query]);

  return state;
}
