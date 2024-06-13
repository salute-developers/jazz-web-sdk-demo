import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { handleEvent } from '@salutejs/jazz-sdk-web';
import { Body2, TextField } from '@salutejs/plasma-b2c';
import debounce from 'lodash/debounce';
import styled from 'styled-components/macro';

import { useRoomContext } from '../../contexts/roomContext';

const Root = styled.div`
  display: grid;
  gap: 16px;
`;

export const TitleSettings: FC = () => {
  const { room } = useRoomContext();

  const [title, setTitle] = useState<string>(
    () => room.settings.title.get() || '',
  );

  useEffect(() => {
    const unsubscribe = handleEvent(
      room.event$,
      'settingsChanged',
      ({ payload }) => {
        if (!payload.title) {
          return;
        }

        setTitle(payload.title);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [room]);

  const debouncedTitleChange = useMemo(() => debounce((title: string) => {
      room.moderator.setSettings({ title });
    }, 200), [room]);

  const handleChange = useCallback(
    (value: string) => {
      setTitle(value);
      debouncedTitleChange(value);
    },
    [debouncedTitleChange],
  );

  return (
    <Root>
      <Body2>Room title</Body2>

      <TextField
        value={title}
        onChange={(event) => handleChange(event.target.value)}
      />
    </Root>
  );
};
