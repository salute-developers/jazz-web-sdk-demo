import { FC, useEffect, useMemo, useState } from 'react';

import {
  getActivity,
  handleEvent,
  JazzRoomParticipant,
  JazzRoomParticipantId,
} from '@salutejs/jazz-sdk-web';
import { Body2, Button } from '@salutejs/plasma-b2c';
import { blackSecondary, dark01, white } from '@salutejs/plasma-tokens-b2c';
import { useQuery } from 'rx-effects-react';
import styled from 'styled-components/macro';

import { Reaction } from '../../../../shared/components/Reaction';
import { VideoContainer } from '../../../../shared/components/VideoContainer';
import { useVideoSources } from '../../../../shared/hooks/useActiveVideoSource';
import { useParticipants } from '../../../../shared/hooks/useParticipants';
import { useVideoElement } from '../../../../shared/hooks/useVideoElement';
import { booleanAttribute } from '../../../../shared/utils/dataAttributes';
import { useRoomContext } from '../../contexts/roomContext';

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

  const [dominantParticipantId, setDominantParticipantId] = useState<
    JazzRoomParticipantId | undefined
  >();

  const [isSwapped, setSwap] = useState(false);

  const localParticipant = useQuery(room.localParticipant);

  const participants = useParticipants(room);

  const activity = useMemo(() => getActivity(room), [room]);

  useEffect(() => {
    if (!localParticipant) {
      return;
    }
    if (participants.length === 1) {
      setDominantParticipantId(localParticipant.id);
    } else if (participants.length === 2) {
      setDominantParticipantId(
        participants.find(
          (participant) => participant.id !== localParticipant.id,
        )?.id,
      );
    }
  }, [participants, localParticipant]);

  useEffect(() => {
    setDominantParticipantId(
      room.dominantParticipantId.get() || room.participants.get()[0]?.id,
    );

    const unsubscribeDominantParticipantId = handleEvent(
      room.event$,
      'dominantSpeakerChanged',
      ({ payload }) => {
        setDominantParticipantId(payload.id);
      },
    );

    return () => {
      unsubscribeDominantParticipantId();
    };
  }, [room]);

  const { primary, secondary } = useVideoSources(dominantParticipantId);

  useEffect(() => {
    if (!secondary) {
      setSwap(false);
    }
  }, [primary, secondary]);

  const canSwapped = Boolean(secondary);

  const primaryVideoElement = useVideoElement<HTMLDivElement>({
    participantId: dominantParticipantId,
    room,
    source: canSwapped ? (isSwapped ? secondary : primary) : primary,
    height: 800,
    quality: 'high',
  });

  const secondaryVideoElement = useVideoElement<HTMLDivElement>({
    participantId: dominantParticipantId,
    room,
    source: canSwapped ? (!isSwapped ? secondary : primary) : secondary,
    height: 200,
    quality: 'medium',
  });

  const dominantParticipant = participants.find(
    ({ id }) => dominantParticipantId === id,
  );
  const isLocalParticipant = localParticipant
    ? localParticipant.id === dominantParticipant?.id
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
        dominant={dominantParticipant}
      />
      <ReactionContainer>
        <ButtonCustom
          onClick={() => {
            activity.setReaction('applause');
          }}
        >
          <Reaction reaction="applause" />
        </ButtonCustom>
        <ButtonCustom
          onClick={() => {
            activity.setReaction('like');
          }}
        >
          <Reaction reaction="like" />
        </ButtonCustom>
        <ButtonCustom
          onClick={() => {
            activity.setReaction('dislike');
          }}
        >
          <Reaction reaction="dislike" />
        </ButtonCustom>
        <ButtonCustom
          onClick={() => {
            activity.setReaction('smile');
          }}
        >
          <Reaction reaction="smile" />
        </ButtonCustom>
        <ButtonCustom
          onClick={() => {
            activity.setReaction('surprise');
          }}
        >
          <Reaction reaction="surprise" />
        </ButtonCustom>
      </ReactionContainer>
    </Wrapper>
  );
};
