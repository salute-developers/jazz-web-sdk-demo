import React from 'react';

import { isBrowser } from '../utils/isBrowser';

export const useEnhancedEffect = isBrowser
  ? React.useLayoutEffect
  : React.useEffect;
