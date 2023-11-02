import { FC } from 'react';

import { background, surfaceLiquid02 } from '@salutejs/plasma-tokens-b2c';
import { light } from '@salutejs/plasma-tokens-b2c/themes';
import { b2c } from '@salutejs/plasma-tokens-b2c/typo';
import {
  compatible as compatibleType,
  standard as standardTypo,
} from '@salutejs/plasma-typo';
import { createGlobalStyle } from 'styled-components/macro';

const PlasmaStyle = createGlobalStyle(light, compatibleType, b2c, standardTypo);

const LayoutStyle = createGlobalStyle`
  html {
    overflow-x: hidden;
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
