import { createContext, FC, useContext, useEffect, useMemo } from 'react';

import { JazzRoom, JazzSdk } from '@salutejs/jazz-sdk-web';
import { createScope } from 'nrgy';
import { Controller } from 'nrgy/mvc';
import { Observable } from 'rxjs';

import { createEventBus, EventBus } from '../utils/createEventBus';
import { createDevicesStorage } from '../utils/mediaSettingsStorage';

const deviceStorage = createDevicesStorage();

export type ErrorEvent = {
  type: 'error';
  payload: {
    title: string;
  };
};

export type Events =
  | ErrorEvent
  | {
      type: 'roomSettingsOpen';
      payload: {
        room: JazzRoom;
      };
    }
  | {
      type: 'roomDetailModalOpen';
      payload: {
        room: JazzRoom;
      };
    }
  | {
      type: 'roomInfoModalOpen';
      payload: {
        room: JazzRoom;
      };
    }
  | {
      type: 'setSdk';
      payload: {
        sdk: JazzSdk | undefined;
      };
    }
  | {
      type: 'message';
      payload: {
        type: string;
        payload?: unknown;
      };
    };

export type Feature = {
  id: string;
  value: string;
  event: {
    type: string;
    payload?: unknown;
  };
};

export type GlobalContext = {
  eventBus: EventBus<Events>;
  event$: Observable<Events>;
  devices: {
    getAudioInput: () => string | undefined;
    setAudioInput: (value: string | undefined) => void;
    getVideoInput: () => string | undefined;
    setVideoInput: (value: string | undefined) => void;
    getAudioOutput: () => string | undefined;
    setAudioOutput: (value: string | undefined) => void;
  };
};

function createGlobalContext(): Controller<GlobalContext> {
  const scope = createScope();
  const eventBus = createEventBus<Events>();
  return {
    devices: deviceStorage,
    eventBus,
    event$: eventBus.event$,
    destroy: scope.destroy,
  };
}

const globalContext = createContext<GlobalContext | undefined>(undefined);

export function useGlobalContext(): GlobalContext {
  const result = useContext(globalContext);

  if (!result) {
    throw new Error('GlobalContext is required');
  }

  return result;
}

export const GlobalContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const context = useMemo(() => createGlobalContext(), []);

  useEffect(() => {
    return () => {
      context.destroy();
    };
  }, [context]);

  return (
    <globalContext.Provider value={context}>{children}</globalContext.Provider>
  );
};
