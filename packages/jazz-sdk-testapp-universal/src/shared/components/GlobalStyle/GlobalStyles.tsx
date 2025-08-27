import { FC } from 'react';

import { plasma_b2c__light } from '@salutejs/plasma-themes';
import {
  backgroundPrimary as background,
  surfaceTransparentSecondary as surfaceLiquid02,
} from '@salutejs/plasma-themes/tokens';
import {
  compatible as compatibleType,
  standard as standardTypo,
} from '@salutejs/plasma-typo';
import { createGlobalStyle } from 'styled-components/macro';

const PlasmaStyle = createGlobalStyle(
  plasma_b2c__light,
  compatibleType,
  standardTypo,
);

const LayoutStyle = createGlobalStyle`
  html {
    background-color: ${background};
    min-height: var(--app-height, 100%);
    scrollbar-color: ${surfaceLiquid02};
    font-family: var(--plasma-typo-body-l-font-family);
  }

  body {
    margin: 0;

    min-height: var(--app-height, 100%);

    &:-webkit-full-screen {
      background: ${background};
    }
  }
`;

export const GlobalStyles: FC = () => {
  return (
    <>
      <PlasmaStyle />
      <LayoutStyle />
    </>
  );
};
