import { useCallback, useState } from 'react';

import { JazzRoom, JazzRoomUserPermissionKey } from '@salutejs/jazz-sdk-web';

import { useQuery } from './useQuery';

export const useUserPermissionRequestCheck = (
  room: JazzRoom,
): {
  permissionRequestCheck: (permissionType: JazzRoomUserPermissionKey) => void;
  leftTime: number;
} => {
  const [leftTime, setLeftTime] = useState(0);
  const permissionRequests = useQuery(room.userPermissionRequests);

  const permissionRequestCheck = useCallback(
    (permissionType: JazzRoomUserPermissionKey) => {
      setLeftTime(0);
      const userRequest = permissionRequests?.get(permissionType);
      if (userRequest) {
        const diff = Date.now() - userRequest.created;
        const rejectSendRequest = Math.max(0, 60000 - diff);
        if (rejectSendRequest) {
          const diffSeconds = Math.floor((diff / 1000) % 60);
          setLeftTime(60 - diffSeconds);
        }
      }
    },
    [permissionRequests],
  );

  return { permissionRequestCheck, leftTime };
};
