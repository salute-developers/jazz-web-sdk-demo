import { useMemo } from 'react';

import { Dropdown, DropdownItemOption, IconButton } from '@salutejs/plasma-b2c';
import { IconAppsFill } from '@salutejs/plasma-icons';
import { compute } from 'nrgy';
import { useAtom } from 'nrgy/react';

import { useGlobalContext } from '../../contexts/globalContext';
import { MenuName } from '../../types/menu';

export type MenuAreaProps = { menuName: MenuName; className?: string };

export const MenuArea: React.FC<MenuAreaProps> = ({ menuName, className }) => {
  const { menuManager, eventBus } = useGlobalContext();

  const menuAtom = useMemo(
    () => compute(() => menuManager.menuState().get(menuName)),
    [menuManager, menuName],
  );

  const menu = useAtom(menuAtom);

  if (!menu) return null;

  const hasMenu = Boolean(menu.items.length);

  if (!hasMenu) return null;

  const dropdownItemOption: DropdownItemOption[] = menu.items.map(
    ({ id, value }) => ({
      label: value,
      value: id,
    }),
  );

  const onItemSelect = (item: DropdownItemOption) => {
    const selectedRoomFeature = menu.items.find(({ id }) => item.value === id);
    if (!selectedRoomFeature) {
      return;
    }

    eventBus({ type: 'message', payload: selectedRoomFeature.event });
  };

  return (
    <Dropdown items={dropdownItemOption} onItemSelect={onItemSelect}>
      <IconButton
        className={className}
        aria-label={menuName}
        title={menuName}
        view="secondary"
        data-testid={`MenuArea.${menuName}`}
      >
        <IconAppsFill />
      </IconButton>
    </Dropdown>
  );
};
