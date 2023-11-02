import { FC, useCallback, useMemo } from 'react';

import {
  Button,
  Dropdown,
  DropdownItemProps,
  DropdownProps,
} from '@salutejs/plasma-b2c';
import { IconMoreHorizontal } from '@salutejs/plasma-icons';
import { white } from '@salutejs/plasma-tokens-b2c';
import { useQuery } from 'rx-effects-react';
import styled from 'styled-components/macro';

import { useGlobalContext } from '../../../../shared/contexts/globalContext';
import { useRoomContext } from '../../contexts/roomContext';

const StyledDropdown = styled(Dropdown)`
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 2;
`;

export const Menu: FC = () => {
  const { eventBus } = useGlobalContext();
  const { room } = useRoomContext();

  const localParticipant = useQuery(room.localParticipant);

  const userPermissions = useQuery(room.userPermissions);

  const menuItems = useMemo<DropdownItemProps[]>(() => {
    const menuArr = [
      {
        index: 0,
        label: 'View room info',
        value: 'info',
      },
      {
        index: 1,
        label: 'Room settings',
        value: 'settings',
      },
    ];

    if (userPermissions?.canFinishCall && localParticipant?.role === 'owner') {
      menuArr.push({
        index: 2,
        label: 'Finish for all',
        value: 'finishForAll',
      });
    }

    return menuArr;
  }, [localParticipant, userPermissions]);

  const handleSelect = useCallback<
    Exclude<DropdownProps['onItemSelect'], undefined>
  >(
    (item) => {
      switch (item.value) {
        case 'info': {
          eventBus({
            type: 'roomInfoModalOpen',
            payload: {
              room,
            },
          });
          break;
        }
        case 'settings': {
          eventBus({
            type: 'roomSettingsOpen',
            payload: {
              room,
            },
          });
          break;
        }
        case 'finishForAll': {
          room.leave({ endConference: true });
          break;
        }
        default:
      }
    },
    [eventBus, room],
  );

  return (
    <StyledDropdown items={menuItems} onItemSelect={handleSelect}>
      <Button view="clear" contentLeft={<IconMoreHorizontal color={white} />} />
    </StyledDropdown>
  );
};
