import { FC, useRef } from 'react';

import { JazzRoomPermissionRequest } from '@salutejs/jazz-sdk-web';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components/macro';

import { useQuery } from '../../../../shared/hooks/useQuery';
import { useRoomContext } from '../../contexts/roomContext';

import { PermissionRequest } from './PermissionRequest';

const Wrapper = styled.div`
  display: grid;
  overflow-y: scroll;
  flex-grow: 1;
  align-content: start;
  padding: 0 0 0 10px;

  @-moz-document url-prefix() {
     {
      scrollbar-width: thin;
    }
  }
`;

export const PermissionRequests: FC<{ className?: string }> = (props) => {
  const { room } = useRoomContext();

  const permissionRequests = useQuery(room.moderator.permissionRequests);

  return (
    <PermissionRequestsScroll
      permissionRequests={permissionRequests}
      {...props}
    />
  );
};

const PermissionRequestsScroll: FC<{
  permissionRequests: readonly JazzRoomPermissionRequest[];
  className?: string;
}> = ({ permissionRequests, ...otherProps }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: permissionRequests.length,
    getScrollElement: () => rootRef.current,
    estimateSize: () => 150,
    overscan: 3,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <Wrapper ref={rootRef} {...otherProps}>
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
            const permissionRequest = permissionRequests[virtualRow.index];
            return (
              <PermissionRequest
                permissionRequest={permissionRequest}
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
