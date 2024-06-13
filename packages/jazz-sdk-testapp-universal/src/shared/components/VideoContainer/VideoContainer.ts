import { dark01 } from '@salutejs/plasma-tokens';
import styled from 'styled-components/macro';

export const VideoContainer = styled.div<{
  'data-paused': boolean | undefined;
  'data-is-invert': boolean | undefined;
  'data-fit'?: 'contain' | 'cover';
  'data-is-shading'?: boolean | undefined;
}>`
  background: ${dark01};
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: absolute;

  & > video {
    pointer-events: none;
    min-width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    background: ${dark01};
  }

  &[data-paused] > video {
    display: none;
  }

  &[data-is-invert] > video {
    transform: scaleX(-1);
  }

  &[data-is-shading] {
    &::after {
      display: block;
      content: '';
      position: absolute;
      background: rgb(0, 0, 0, 0.35);
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    }
  }

  &[data-fit='cover'] > video {
    object-fit: cover;
  }

  &[data-fit='contain'] > video {
    object-fit: contain;
  }
`;
