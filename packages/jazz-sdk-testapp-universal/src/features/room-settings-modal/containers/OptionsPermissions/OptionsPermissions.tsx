import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
  handleQuery,
  JazzRoomUserPermissionKey,
  JazzRoomUserPermissions,
} from '@salutejs/jazz-sdk-web';
import { Body2, Checkbox } from '@salutejs/plasma-b2c';
import debounce from 'lodash/debounce';
import styled from 'styled-components/macro';

import { useQuery } from '../../../../shared/hooks/useQuery';
import { useRoomContext } from '../../contexts/roomContext';

const Root = styled.div`
  display: grid;
  gap: 16px;
`;

export const OptionsPermissions: FC = () => {
  const { room } = useRoomContext();

  const localParticipant = useQuery(room.localParticipant);

  if (!localParticipant || localParticipant.role !== 'owner') {
    return null;
  }

  return <Content />;
};

const Content: FC = () => {
  const { room } = useRoomContext();

  const userPermissions = useQuery(room.userPermissions);

  const [userPermissionsState, setUserPermissionsState] = useState<
    Partial<JazzRoomUserPermissions>
  >(() => ({ ...room.moderator.rolePermissions.get().member }));

  useEffect(() => {
    const unsubscribe = handleQuery(
      room.moderator.rolePermissions,
      (rolePermissions) => {
        setUserPermissionsState(rolePermissions.member);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [room]);

  const debouncedSetSettingsRequest = useMemo(() => debounce((props: Partial<JazzRoomUserPermissions>) => {
      room.moderator.setRolePermissions({ role: 'member', permissions: props });
    }, 200), [room]);

  const handleChange = useCallback(
    (permission: JazzRoomUserPermissionKey) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setUserPermissionsState((prevState) => {
          const result = {
            ...prevState,
            [permission]: checked,
          };

          debouncedSetSettingsRequest(result);

          return result;
        });
      },
    [debouncedSetSettingsRequest],
  );

  const isDisabled = !userPermissions.canEditRoomPolicy;

  return (
    <Root>
      <Body2>Permissions</Body2>

      <Checkbox
        checked={userPermissionsState.canShareAudio ?? false}
        onChange={handleChange('canShareAudio')}
        label="Enable microphone"
        disabled={isDisabled}
      />
      <Checkbox
        checked={userPermissionsState.canShareCamera ?? false}
        onChange={handleChange('canShareCamera')}
        label="Enable camera"
        disabled={isDisabled}
      />
      <Checkbox
        checked={userPermissionsState.canShareMedia ?? false}
        onChange={handleChange('canShareMedia')}
        label="Enable screen capture"
        disabled={isDisabled}
      />
      <Checkbox
        checked={userPermissionsState.canSendReaction ?? false}
        onChange={handleChange('canSendReaction')}
        label="Send reactions"
        disabled={isDisabled}
      />
    </Root>
  );
};
