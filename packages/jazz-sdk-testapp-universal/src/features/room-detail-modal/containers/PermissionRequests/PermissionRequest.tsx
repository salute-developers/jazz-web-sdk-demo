import { forwardRef, useCallback } from 'react';

import { JazzRoomPermissionRequest } from '@salutejs/jazz-sdk-web';
import { Button } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { useQuery } from '../../../../shared/hooks/useQuery';
import { useRoomContext } from '../../contexts/roomContext';
type PermissionRequestProps = {
  permissionRequest: JazzRoomPermissionRequest;
};

const Wrapper = styled.div`
  padding: 4px;
`;

const Root = styled.div`
  width: 100%;
  border-radius: 16px;
  background: #fff;
  display: grid;
  padding: 8px;
  grid-template-columns: 1fr auto auto;
  gap: 4px;
  align-items: center;
  box-sizing: border-box;
`;

const Text = styled.div``;

const REQUEST_PERMISSION_MESSAGE: Record<string, string> = {
  canShareAudio: 'wants to turn on the microphone',
  canShareCamera: 'wants to turn on the camera',
  canShareMedia: 'wants to turn on the screen capture',
  canSendReaction: 'wants to send reactions',
};

const getMessage = (permission: string): string => {
  return (
    REQUEST_PERMISSION_MESSAGE[permission] ||
    'wants to perform an undefined action'
  );
};

export const PermissionRequest = forwardRef<
  HTMLDivElement,
  PermissionRequestProps
>(({ permissionRequest, ...otherProps }, ref) => {
  const { room } = useRoomContext();

  const participants = useQuery(room.participants);

  const participant = participants.find(
    (item) => item.id === permissionRequest.participantId,
  );

  const handleAllowPermission = useCallback(() => {
    room.moderator.grantPermission(
      permissionRequest.participantId,
      permissionRequest.permissionKey,
      true,
    );
  }, [room, permissionRequest]);

  const handleDisallowPermission = useCallback(() => {
    room.moderator.grantPermission(
      permissionRequest.participantId,
      permissionRequest.permissionKey,
      false,
    );
  }, [room, permissionRequest]);

  return (
    <Wrapper ref={ref} {...otherProps}>
      <Root>
        <Text>
          <b>{participant?.name}</b>{' '}
          {getMessage(permissionRequest.permissionKey)}
        </Text>
        <Button onClick={handleAllowPermission} text="Allow" view="primary" />
        <Button onClick={handleDisallowPermission} text="Disallow" />
      </Root>
    </Wrapper>
  );
});
