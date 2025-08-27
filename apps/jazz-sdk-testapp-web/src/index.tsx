import React from 'react';

import { createJazzSdkWeb } from '@salutejs/jazz-sdk-web';
import { AppContainer } from 'jazz-sdk-testapp-universal/src';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(<AppContainer createJazzSdk={createJazzSdkWeb} />);
