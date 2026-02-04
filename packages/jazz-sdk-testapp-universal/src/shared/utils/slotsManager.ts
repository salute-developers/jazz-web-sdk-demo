import { Atom, createScope } from 'nrgy';
import { Controller } from 'nrgy/mvc';

import { SlotName } from '../types/slots';

// Определение типа Slot
export type Slot = {
  name: SlotName;
  components: React.ComponentType<unknown>[];
};

export type SlotsManager = {
  slots: Atom<Map<SlotName, Slot>>;
  register: (
    slotName: SlotName,
    Component: React.ComponentType<unknown>,
  ) => () => void;
};

export type SlotsManagerController = Controller<SlotsManager>;

export const createSlotsManager = (): SlotsManagerController => {
  const scope = createScope();
  const slots = scope.atom<Map<SlotName, Slot>>(new Map());
  // Регистрирует компонент плагина в слоте
  const register = (
    slotName: SlotName,
    Component: React.ComponentType<unknown>,
  ) => {
    slots.update((prev) => {
      const updated = new Map<SlotName, Slot>(prev);
      const slot: Slot = updated.get(slotName) || {
        name: slotName,
        components: [],
      };
      slot.components.push(Component);
      updated.set(slotName, slot);
      return updated;
    });

    return () => {
      slots.update((prev) => {
        const updated = new Map<SlotName, Slot>(prev);
        const slot: Slot | undefined = updated.get(slotName); // Получаем слот
        if (!slot) return prev; // Если слот не найден, возвращаем предыдущее состояние

        // Удаляем указанный компонент из массива компонентов
        slot.components = slot.components.filter(
          (component) => component !== Component,
        );

        updated.set(slotName, slot); // Обновляем слот
        return updated;
      });
    };
  };

  return {
    slots,
    register,
    destroy: scope.destroy,
  };
};
