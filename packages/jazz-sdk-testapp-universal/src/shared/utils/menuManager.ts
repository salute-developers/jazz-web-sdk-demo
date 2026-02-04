import { Atom, createScope } from 'nrgy';
import { Controller } from 'nrgy/mvc';

import { MenuName } from '../types/menu';

export type Menu = {
  name: MenuName;
  items: MenuItem[];
};

export type MenuItem = {
  id: string;
  value: string;
  event: {
    type: string;
    payload?: unknown;
  };
};

export type MenuManager = {
  menuState: Atom<Map<MenuName, Menu>>;
  register: (menuName: MenuName, item: MenuItem) => () => void;
};

export type MenuManagerController = Controller<MenuManager>;

export const createMenuManager = (): MenuManagerController => {
  const scope = createScope();
  const menuState = scope.atom<Map<MenuName, Menu>>(new Map());
  // Регистрирует компонент плагина в слоте
  const register = (menuName: MenuName, item: MenuItem) => {
    menuState.update((prev) => {
      const updated = new Map<MenuName, Menu>(prev);
      const slot: Menu = updated.get(menuName) || {
        name: menuName,
        items: [],
      };
      slot.items.push(item);
      updated.set(menuName, slot);
      return updated;
    });

    return () => {
      menuState.update((prev) => {
        const updated = new Map<MenuName, Menu>(prev);
        const menu: Menu | undefined = updated.get(menuName); // Получаем слот
        if (!menu) return prev; // Если слот не найден, возвращаем предыдущее состояние

        // Удаляем указанный компонент из массива компонентов
        menu.items = menu.items.filter((_item) => _item !== item);

        updated.set(menuName, menu); // Обновляем слот
        return updated;
      });
    };
  };

  return {
    menuState,
    register,
    destroy: scope.destroy,
  };
};
