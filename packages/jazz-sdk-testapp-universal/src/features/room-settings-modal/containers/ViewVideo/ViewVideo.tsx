import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { handleEvent } from '@salutejs/jazz-sdk-web';
import {
  getVideoElementPool,
  PausedMediaTypes,
} from '@salutejs/jazz-sdk-web-plugins';
import { Body2, DropdownItemProps, Select } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { useRoomContext } from '../../contexts/roomContext';

export type ViewState =
  | 'allPlay'
  | 'playOnlyCamera'
  | 'playOnlyDesktop'
  | 'allPause';

const Title = styled(Body2)`
  margin-bottom: 16px;
`;

const SELECT_ITEMS: DropdownItemProps[] = [
  {
    value: 'allPlay',
    label: 'all video played',
    index: 0,
  },
  {
    value: 'playOnlyCamera',
    label: 'play only camera',
    index: 1,
  },
  {
    value: 'playOnlyDesktop',
    label: 'play only desktop',
    index: 2,
  },
  {
    value: 'allPause',
    label: 'all video paused',
    index: 3,
  },
];

function getActiveState(pausedTypes: PausedMediaTypes): ViewState {
  if (pausedTypes.displayScreen && pausedTypes.video) {
    return 'allPause';
  } else if (pausedTypes.displayScreen) {
    return 'playOnlyCamera';
  } else if (pausedTypes.video) {
    return 'playOnlyDesktop';
  } else {
    return 'allPlay';
  }
}

export const ViewVideo: FC = () => {
  const { room } = useRoomContext();

  const [state, setState] = useState<ViewState>('allPlay');

  const videoElementPool = useMemo(() => {
    return getVideoElementPool(room);
  }, [room]);

  useEffect(() => {
    const pausedTypes = videoElementPool.getPausedMediaTypes();
    setState(getActiveState(pausedTypes));

    const unsubscribe = handleEvent(
      videoElementPool.event$,
      'mediaPaused',
      ({ payload }) => {
        setState(getActiveState(payload));
      },
    );

    return () => {
      unsubscribe();
    };
  }, [videoElementPool]);

  const handleChange = useCallback(
    (id: ViewState) => {
      switch (id) {
        case 'allPlay': {
          videoElementPool.playSource();
          break;
        }
        case 'allPause': {
          videoElementPool.pauseSource();
          break;
        }
        case 'playOnlyCamera': {
          videoElementPool.playSource('user');
          videoElementPool.pauseSource('display');
          break;
        }
        case 'playOnlyDesktop': {
          videoElementPool.pauseSource('user');
          videoElementPool.playSource('display');
          break;
        }
        default:
      }
    },
    [videoElementPool],
  );

  return (
    <div>
      <Title>View video</Title>
      <Select value={state} items={SELECT_ITEMS} onChange={handleChange} />
    </div>
  );
};
