import { createContext, FC, useContext, useEffect, useMemo } from 'react';

import { createScope } from 'nrgy';
import { Controller } from 'nrgy/mvc';

import { Events, GlobalContext } from '../types/globalContext';
import { Plugin } from '../types/plugins';
import { createEventBus } from '../utils/createEventBus';
import { createMediaManager } from '../utils/mediaManager';
import { createDevicesStorage } from '../utils/mediaSettingsStorage';
import { createMenuManager } from '../utils/menuManager';
import { pluginsInit } from '../utils/plugins';
import { createSlotsManager } from '../utils/slotsManager';

const deviceStorage = createDevicesStorage();

function createGlobalContext(
  plugins: Plugin[] | undefined,
): Controller<GlobalContext> {
  const scope = createScope();
  const eventBus = createEventBus<Events>();
  const slotsManager = scope.add(createSlotsManager());
  const menuManager = scope.add(createMenuManager());
  const mediaManager = scope.add(createMediaManager());
  const context: Controller<GlobalContext> = {
    slotsManager,
    menuManager,
    mediaManager,
    devices: deviceStorage,
    eventBus,
    event$: eventBus.event$,
    destroy: scope.destroy,
    scope,
  };

  if (plugins) {
    pluginsInit(plugins, context);
  }

  return context;
}

const globalContext = createContext<GlobalContext | undefined>(undefined);

export function useGlobalContext(): GlobalContext {
  const result = useContext(globalContext);

  if (!result) {
    throw new Error('GlobalContext is required');
  }

  return result;
}

export const GlobalContextProvider: FC<{
  children: React.ReactNode;
  plugins: Plugin[] | undefined;
}> = ({ plugins, children }) => {
  const context = useMemo(() => createGlobalContext(plugins), [plugins]);

  useEffect(() => {
    return () => {
      context.destroy();
    };
  }, [context]);

  return (
    <globalContext.Provider value={context}>{children}</globalContext.Provider>
  );
};
