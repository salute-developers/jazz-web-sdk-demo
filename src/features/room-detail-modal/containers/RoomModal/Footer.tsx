import { FC, useCallback } from 'react';

import { Button } from '@salutejs/plasma-b2c';
import { black } from '@salutejs/plasma-tokens-b2c';
import { useQuery } from 'rx-effects-react';
import styled from 'styled-components/macro';

import { RoomActions } from '../../../../shared/containers/Actions';
import { GlobalMute } from '../../../../shared/containers/GlobalMute';
import { useGlobalContext } from '../../../../shared/contexts/globalContext';
import { useRoomContext } from '../../contexts/roomContext';

const CustomGlobalMute = styled(GlobalMute)`
  margin-left: 8px;
`;

const Wrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 12px 16px;
  box-sizing: border-box;
`;

const RoomActionsWrapper = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
`;

const RightSide = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const LeftSide = styled.div`
  display: flex;
  align-items: center;
`;

export const Footer: FC = () => {
  const { room } = useRoomContext();
  const { eventBus } = useGlobalContext();

  const localParticipant = useQuery(room.localParticipant);
  const userPermissions = useQuery(room.userPermissions);

  const handleViewRoomInfo = useCallback(() => {
    eventBus({
      type: 'roomInfoModalOpen',
      payload: {
        room,
      },
    });
  }, [room, eventBus]);

  return (
    <Wrapper>
      <LeftSide>
        <Button view="primary" onClick={handleViewRoomInfo}>
          View room info
        </Button>
        <CustomGlobalMute room={room} iconColor={black} />
      </LeftSide>
      <RoomActionsWrapper>
        <RoomActions room={room} />
      </RoomActionsWrapper>
      <RightSide>
        {userPermissions?.canFinishCall &&
        localParticipant?.role === 'owner' ? (
          <Button
            view="critical"
            onClick={() => room.leave({ endConference: true })}
          >
            Finish for all
          </Button>
        ) : null}
      </RightSide>
    </Wrapper>
  );
};
