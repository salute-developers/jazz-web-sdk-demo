import { FC, useRef } from 'react';

import { getLobby } from '@salutejs/jazz-sdk-web';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components/macro';

import { useQuery } from '../../../../shared/hooks/useQuery';
import { useRoomContext } from '../../contexts/roomContext';
import { LobbyParticipant } from '../LobbyParticipant';

const Wrapper = styled.div`
  display: grid;
  overflow-y: scroll;
  flex-grow: 1;
  align-content: start;
  padding: 0;

  @-moz-document url-prefix() {
     {
      scrollbar-width: thin;
    }
  }
`;

export const LobbyParticipants: FC = () => {
  const { room } = useRoomContext();
  const lobby = getLobby(room);
  const participants = useQuery(lobby.participants);
  const rootRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: participants.length,
    getScrollElement: () => rootRef.current,
    estimateSize: () => 150,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <Wrapper ref={rootRef}>
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            overflow: 'hidden',
            transform: items[0]
              ? `translateY(${items[0].start}px)`
              : `translateY(0px)`,
          }}
        >
          {items.map((virtualRow) => {
            const participant = participants[virtualRow.index];
            return (
              <LobbyParticipant
                lobbyParticipant={participant}
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
              />
            );
          })}
        </div>
      </div>
    </Wrapper>
  );
};
