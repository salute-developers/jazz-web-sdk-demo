import { createContext, FC, useContext, useMemo } from 'react';

import { JazzRoom } from '@salutejs/jazz-sdk-web';

export type RoomContext = {
  room: JazzRoom;
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
  const state = useMemo(() => {
    return {
      room,
    };
  }, [room]);

  return <RoomContext.Provider value={state}>{children}</RoomContext.Provider>;
};
