import { createContext, FC, useContext, useState } from 'react';

import { JazzRoom } from '@salutejs/jazz-sdk-web';

import { createEventBus, EventBus } from '../../../shared/utils/createEventBus';

type EventBusEvent = {
  type: 'openLobbyModal';
};

export type RoomContext = {
  room: JazzRoom;
  eventBus: EventBus<EventBusEvent>;
};

const RoomContext = createContext<RoomContext | undefined>(undefined);

export function useRoomContext(): RoomContext {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('RoomContext is required');
  }
  return context;
}

export const RoomContextProvider: FC<{
  room: JazzRoom;
  children: React.ReactNode;
}> = ({ children, room }) => {
  const [state] = useState(() => {
    return {
      eventBus: createEventBus<EventBusEvent>(),
      room,
    };
  });

  return <RoomContext.Provider value={state}>{children}</RoomContext.Provider>;
};
