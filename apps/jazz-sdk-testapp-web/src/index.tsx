import React from 'react';

import ReactDOM from 'react-dom/client';

import { AppContainer } from 'jazz-sdk-testapp-universal/src';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(<AppContainer />);
