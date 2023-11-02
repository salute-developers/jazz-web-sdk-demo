import { forwardRef } from 'react';

import { JazzRoomParticipant } from '@salutejs/jazz-sdk-web';
import {
  IconCameraVideo,
  IconMic,
  IconMicOff,
  IconPersone,
  IconVideoOff,
} from '@salutejs/plasma-icons';
import { blackSecondary, white } from '@salutejs/plasma-tokens-b2c';
import { useQuery } from 'rx-effects-react';
import styled from 'styled-components/macro';

import { VideoContainer } from '../../../../shared/components/VideoContainer';
import { useVideoSources } from '../../../../shared/hooks/useActiveVideoSource';
import { useAudioSource } from '../../../../shared/hooks/useAudioSource';
import { useVideoElement } from '../../../../shared/hooks/useVideoElement';
import { booleanAttribute } from '../../../../shared/utils/dataAttributes';
import { useRoomContext } from '../../contexts/roomContext';
import { MuteButton } from '../MuteButton';

export type ParticipantProps = {
  participant: JazzRoomParticipant;
};

const CustomMuteButton = styled(MuteButton)`
  position: absolute;
  left: 4px;
  top: 4px;
  z-index: 2;
`;

const Wrapper = styled.div<{
  'data-is-dominant': boolean | undefined;
}>`
  width: 250px;
  height: 150px;
  border-radius: 16px;
  border: 4px solid transparent;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  transition: border-color 300ms ease-in-out;

  &[data-is-dominant] {
    border-color: #3fa058;
  }
`;

const ParticipantInfo = styled.div`
  width: 100%;
  position: absolute;
  bottom: 0;
  color: ${white};
  padding: 4px 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${blackSecondary};
  justify-content: space-between;
`;

const OwnerRole = styled.div`
  position: absolute;
  right: 4px;
  top: 4px;
  height: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  box-sizing: border-box;
  background: ${blackSecondary};
`;

const UserName = styled.div`
  text-overflow: ellipsis;
  overflow-x: hidden;
  white-space: nowrap;
`;

const Indicators = styled.div`
  display: grid;
  gap: 4px;
  grid-template-columns: 1fr 1fr;
`;

const SecondaryVideoContainerWrapper = styled.div`
  width: 68px;
  height: 68px;
  border-radius: 16px;
  position: absolute;
  bottom: 4px;
  left: 4px;
  overflow: hidden;
  box-shadow: 0 6px 8px;
`;

export const Participant = forwardRef<HTMLDivElement, ParticipantProps>(
  ({ participant, ...otherProps }, ref) => {
    const { room } = useRoomContext();
    const localParticipant = useQuery(room.localParticipant);
    const dominantParticipantId = useQuery(room.dominantParticipantId);
    const isLocalParticipant = localParticipant?.id === participant.id;
    const isDominantParticipantId = participant.id === dominantParticipantId;

    const { primary, secondary } = useVideoSources(participant.id);

    const { isAudioMuted } = useAudioSource({
      participantId: participant.id,
      room,
    });

    const primaryVideoElement = useVideoElement<HTMLDivElement>({
      participantId: participant.id,
      room,
      source: primary,
      height: 150,
      quality: 'medium',
    });

    const secondaryVideoElement = useVideoElement<HTMLDivElement>({
      participantId: participant.id,
      room,
      source: secondary,
      height: 100,
      quality: 'medium',
    });

    const useName = isLocalParticipant
      ? `(You) ${participant.name}`
      : participant.name;

    return (
      <Wrapper
        data-is-dominant={booleanAttribute(isDominantParticipantId)}
        ref={ref}
        {...otherProps}
      >
        {!isLocalParticipant && (
          <CustomMuteButton participantId={participant.id} room={room} />
        )}
        <VideoContainer
          ref={primaryVideoElement.videoRootRef}
          data-paused={booleanAttribute(primaryVideoElement.isVideoPaused)}
          data-is-invert={booleanAttribute(
            primaryVideoElement.source === 'display'
              ? false
              : isLocalParticipant,
          )}
          data-fit="cover"
        />
        {secondary ? (
          <SecondaryVideoContainerWrapper>
            <VideoContainer
              ref={secondaryVideoElement.videoRootRef}
              data-paused={booleanAttribute(
                secondaryVideoElement.isVideoPaused,
              )}
              data-is-invert={booleanAttribute(
                secondaryVideoElement.source === 'display'
                  ? false
                  : isLocalParticipant,
              )}
              data-fit="cover"
            />
          </SecondaryVideoContainerWrapper>
        ) : null}
        {participant.role === 'owner' && (
          <OwnerRole title="Owner">
            <IconPersone size="xs" color={'rgb(94, 148, 255)'} />
          </OwnerRole>
        )}
        <ParticipantInfo>
          <UserName>{useName}</UserName>

          <Indicators>
            {primaryVideoElement.isVideoMuted ? (
              <IconVideoOff color={white} />
            ) : (
              <IconCameraVideo color={white} />
            )}
            {isAudioMuted ? (
              <IconMicOff color={white} />
            ) : (
              <IconMic color={white} />
            )}
          </Indicators>
        </ParticipantInfo>
      </Wrapper>
    );
  },
);
