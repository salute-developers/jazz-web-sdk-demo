import { useEffect, useState } from 'react';

import { createVideoPool, VideoPool } from './utils';

export function useVideoPool(): VideoPool {
  const [videoPool] = useState<VideoPool>(() => {
    return createVideoPool();
  });

  useEffect(() => {
    return () => {
      videoPool.releaseAll();
    };
  }, [videoPool]);

  return videoPool;
}
