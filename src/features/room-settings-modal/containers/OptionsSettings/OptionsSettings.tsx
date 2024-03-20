import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
  getLobby,
  handleEvent,
  JazzLobbySettingsUpdate,
} from '@salutejs/jazz-sdk-web';
import { Body2, Checkbox } from '@salutejs/plasma-b2c';
import debounce from 'lodash/debounce';
import isNil from 'lodash/isNil';
import styled from 'styled-components/macro';

import { useRoomContext } from '../../contexts/roomContext';

const Root = styled.div`
  display: grid;
  gap: 16px;
`;

export const OptionsSettings: FC = () => {
  const { room } = useRoomContext();

  const lobby = getLobby(room);

  const [lobbyChecked, setLobbyChecked] = useState<boolean>(
    () => lobby.settings.isLobbyEnabled.get() ?? false,
  );

  useEffect(() => {
    const unsubscribe = handleEvent(
      lobby.event$,
      'settingsChanged',
      ({ payload }) => {
        if (!isNil(payload.isLobbyEnabled)) {
          setLobbyChecked(payload.isLobbyEnabled);
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, [lobby]);

  const debouncedSetSettingsRequest = useMemo(() => {
    return debounce((props: JazzLobbySettingsUpdate) => {
      lobby.moderator.setSettings(props);
    }, 200);
  }, [lobby]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      setLobbyChecked(checked);
      debouncedSetSettingsRequest({ isLobbyEnabled: checked });
    },
    [debouncedSetSettingsRequest],
  );

  return (
    <Root>
      <Body2>Options</Body2>

      <Checkbox
        checked={lobbyChecked}
        onChange={handleChange}
        label="Enable lobby"
      />
    </Root>
  );
};
