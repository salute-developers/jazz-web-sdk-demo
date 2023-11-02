import { createContext, FC, useContext, useEffect, useState } from 'react';

import { handleEvent, JazzRoom, JazzSdk } from '@salutejs/jazz-sdk-web';
import { Observable } from 'rxjs';

import { createEventBus, EventBus } from '../utils/createEventBus';

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
        sdk: JazzSdk;
      };
    };

export type GlobalContext = {
  sdk: JazzSdk | undefined;
  setSdk: (sdk: JazzSdk) => void;
  eventBus: EventBus<Events>;
  event$: Observable<Events>;
};

function getInitialState(): GlobalContext {
  const eventBus = createEventBus<Events>();

  return {
    sdk: undefined,
    setSdk: (sdk) => {
      eventBus({
        type: 'setSdk',
        payload: {
          sdk,
        },
      });
    },
    eventBus,
    event$: eventBus.event$,
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

export const GlobalContextProvider: FC = ({ children }) => {
  const [state, setState] = useState<GlobalContext>(getInitialState);

  useEffect(() => {
    const unsubscribeSetSdk = handleEvent(
      state.event$,
      'setSdk',
      ({ payload: { sdk } }) => {
        setState((prevState) => ({ ...prevState, sdk }));
      },
    );

    return () => {
      unsubscribeSetSdk();
    };
  }, [state]);

  return (
    <globalContext.Provider value={state}>{children}</globalContext.Provider>
  );
};
