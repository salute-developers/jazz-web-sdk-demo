import { ComponentProps, FC, useCallback, useMemo } from 'react';

import { Button, Dropdown, DropdownItemProps } from '@salutejs/plasma-b2c';
import { IconMoreHorizontal } from '@salutejs/plasma-icons';
import { onDarkTextPrimary as white } from '@salutejs/plasma-themes/tokens';
import styled from 'styled-components/macro';

import { useGlobalContext } from '../../../../shared/contexts/globalContext';
import { useQuery } from '../../../../shared/hooks/useQuery';
import { useRoomContext } from '../../contexts/roomContext';

const StyledDropdown = styled(Dropdown)`
  position: absolute;
  top: 4px;
  transform: translate(-80%, -10%);
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
    Exclude<ComponentProps<typeof Dropdown>['onItemSelect'], undefined>
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
      <Button view="clear">
        <IconMoreHorizontal color={white} />
      </Button>
    </StyledDropdown>
  );
};
