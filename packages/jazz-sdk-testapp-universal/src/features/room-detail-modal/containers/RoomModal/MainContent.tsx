import { FC, useEffect, useMemo, useState } from 'react';

import {
  getActivity,
  JazzRoom,
  JazzRoomParticipant,
} from '@salutejs/jazz-sdk-web';
import { Body2, Button } from '@salutejs/plasma-b2c';
import { blackSecondary, dark01, white } from '@salutejs/plasma-tokens';
import styled from 'styled-components/macro';

import { Reaction } from '../../../../shared/components/Reaction';
import { VideoContainer } from '../../../../shared/components/VideoContainer';
import { useVideoSources } from '../../../../shared/hooks/useActiveVideoSource';
import { useParticipants } from '../../../../shared/hooks/useParticipants';
import { useQuery } from '../../../../shared/hooks/useQuery';
import { useVideoElement } from '../../../../shared/hooks/useVideoElement';
import { booleanAttribute } from '../../../../shared/utils/dataAttributes';
import { useRoomContext } from '../../contexts/roomContext';
import { PermissionRequests } from '../PermissionRequests';

const PermissionRequestsCustom = styled(PermissionRequests)`
  height: 100%;
  width: 520px;
  margin-left: auto;
`;

const ButtonCustom = styled(Button)`
  padding: 8px;
  height: 40px;
`;

const ReactionContainer = styled.div`
  position: absolute;
  bottom: 0px;
  right: 0px;
  gap: 2px;
  display: grid;
  grid-auto-flow: column;
`;

const Wrapper = styled.div`
  position: relative;
  background: ${dark01};
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  margin-right: 16px;
`;

const ViewInfoText = styled(Body2)`
  position: absolute;
  color: ${white};
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const UserName = styled.div`
  text-overflow: ellipsis;
  overflow-x: hidden;
  white-space: nowrap;
  max-width: 80%;
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: ${blackSecondary};
  color: ${white};
  padding: 4px 8px;
  box-sizing: border-box;
  border-radius: 8px;
`;

const SecondaryVideoContainerWrapper = styled.div`
  width: 168px;
  height: 168px;
  border-radius: 16px;
  position: absolute;
  bottom: 4px;
  left: 4px;
  overflow: hidden;
  box-shadow: 0 6px 8px;
`;

type PlaceholderProps = {
  dominant: JazzRoomParticipant | undefined;
  isVideoMuted: boolean;
  isLocalParticipant: boolean;
};

const Placeholder: FC<PlaceholderProps> = ({
  dominant,
  isVideoMuted,
  isLocalParticipant,
}) => {
  if (!isVideoMuted) {
    return dominant ? <UserName>{dominant.name}</UserName> : null;
  }

  if (isLocalParticipant) {
    return <ViewInfoText>Unmute camera</ViewInfoText>;
  }

  if (dominant) {
    return <ViewInfoText>{dominant.name}</ViewInfoText>;
  }

  return null;
};

export const MainContent: FC = () => {
  const { room } = useRoomContext();

  const [isSwapped, setSwap] = useState(false);

  const localParticipant = useQuery(room.localParticipant);

  const participants = useParticipants(room);

  const visibleParticipantId = participants[0]?.id;

  const { primary, secondary } = useVideoSources(visibleParticipantId);

  useEffect(() => {
    if (!secondary) {
      setSwap(false);
    }
  }, [secondary]);

  const canSwapped = Boolean(secondary);

  const primaryVideoElement = useVideoElement<HTMLDivElement>({
    participantId: visibleParticipantId,
    room,
    source: canSwapped ? (isSwapped ? secondary : primary) : primary,
    height: 800,
    width: 1280,
  });

  const secondaryVideoElement = useVideoElement<HTMLDivElement>({
    participantId: visibleParticipantId,
    room,
    source: canSwapped ? (!isSwapped ? secondary : primary) : secondary,
    height: 200,
    width: 600,
  });

  const visibleParticipant = participants.find(
    ({ id }) => visibleParticipantId === id,
  );
  const isLocalParticipant = localParticipant
    ? localParticipant.id === visibleParticipant?.id
    : false;

  return (
    <Wrapper>
      <VideoContainer
        ref={primaryVideoElement.videoRootRef}
        data-paused={booleanAttribute(primaryVideoElement.isVideoPaused)}
        data-is-invert={booleanAttribute(
          primaryVideoElement.source === 'display' ? false : isLocalParticipant,
        )}
        data-is-shading={booleanAttribute(
          primaryVideoElement.source === 'display' && isLocalParticipant,
        )}
        data-fit="cover"
      />
      {secondary ? (
        <SecondaryVideoContainerWrapper
          onClick={() => {
            setSwap((prevState) => !prevState);
          }}
        >
          <VideoContainer
            ref={secondaryVideoElement.videoRootRef}
            data-paused={booleanAttribute(secondaryVideoElement.isVideoPaused)}
            data-is-invert={booleanAttribute(
              secondaryVideoElement.source === 'display'
                ? false
                : isLocalParticipant,
            )}
            data-is-shading={booleanAttribute(
              secondaryVideoElement.source === 'display' && isLocalParticipant,
            )}
            data-fit="cover"
          />
        </SecondaryVideoContainerWrapper>
      ) : null}
      <Placeholder
        isVideoMuted={primaryVideoElement.isVideoMuted}
        isLocalParticipant={isLocalParticipant}
        dominant={visibleParticipant}
      />
      <PermissionRequestsCustom />
      <Reactions room={room} />
    </Wrapper>
  );
};

const Reactions: FC<{ room: JazzRoom }> = ({ room }) => {
  const activity = useMemo(() => getActivity(room), [room]);
  const userPermissions = useQuery(room.userPermissions);

  return (
    <ReactionContainer>
      <ButtonCustom
        disabled={!userPermissions.canSendReaction}
        onClick={() => {
          activity.setReaction('applause');
        }}
      >
        <Reaction reaction="applause" />
      </ButtonCustom>
      <ButtonCustom
        disabled={!userPermissions.canSendReaction}
        onClick={() => {
          activity.setReaction('like');
        }}
      >
        <Reaction reaction="like" />
      </ButtonCustom>
      <ButtonCustom
        disabled={!userPermissions.canSendReaction}
        onClick={() => {
          activity.setReaction('dislike');
        }}
      >
        <Reaction reaction="dislike" />
      </ButtonCustom>
      <ButtonCustom
        disabled={!userPermissions.canSendReaction}
        onClick={() => {
          activity.setReaction('smile');
        }}
      >
        <Reaction reaction="smile" />
      </ButtonCustom>
      <ButtonCustom
        disabled={!userPermissions.canSendReaction}
        onClick={() => {
          activity.setReaction('surprise');
        }}
      >
        <Reaction reaction="surprise" />
      </ButtonCustom>
    </ReactionContainer>
  );
};
