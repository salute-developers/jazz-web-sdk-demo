import { useEffect, useState } from 'react';

import { createVideoPool, VideoPool } from './utils';

export function useVideoPool(): VideoPool {
  const [videoPool] = useState<VideoPool>(() => createVideoPool());

  useEffect(() => () => {
      videoPool.releaseAll();
    }, [videoPool]);

  return videoPool;
}
