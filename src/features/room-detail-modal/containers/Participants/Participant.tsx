import { forwardRef } from 'react';

import { JazzRoomParticipant } from '@salutejs/jazz-sdk-web';
import {
  IconCameraVideo,
  IconDisplay,
  IconMic,
  IconMicOff,
  IconPersone,
  IconVideoOff,
} from '@salutejs/plasma-icons';
import { black, blackSecondary, white } from '@salutejs/plasma-tokens';
import styled from 'styled-components/macro';

import { VideoContainer } from '../../../../shared/components/VideoContainer';
import { useVideoSources } from '../../../../shared/hooks/useActiveVideoSource';
import { useAudioSource } from '../../../../shared/hooks/useAudioSource';
import { useQuery } from '../../../../shared/hooks/useQuery';
import { useRaiseHand } from '../../../../shared/hooks/useRaiseHand';
import { useVideoElement } from '../../../../shared/hooks/useVideoElement';
import { HandIcon } from '../../../../shared/icons/HandIcon';
import { booleanAttribute } from '../../../../shared/utils/dataAttributes';
import { useRoomContext } from '../../contexts/roomContext';
import { MuteButton } from '../MuteButton';
import { ParticipantModeratorDropdown } from '../ParticipantModeratorDropdown';
import { ParticipantReaction } from '../ParticipantReaction';

export type ParticipantProps = {
  participant: JazzRoomParticipant;
};

const ParticipantModeratorDropdownCustom = styled(ParticipantModeratorDropdown)`
  position: absolute;
  z-index: 100;
  right: 0;
  top: 0;
  display: none;
`;

const UpLeftContainer = styled.div`
  position: absolute;
  left: 4px;
  top: 4px;
  z-index: 2;
  display: grid;
  gap: 4px;
  grid-template-columns: auto auto;

  & > * {
    margin-left: -12px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const IconPersoneCustom = styled(IconPersone)`
  color: rgb(94, 148, 255);
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

  &:hover {
    ${ParticipantModeratorDropdownCustom} {
      display: block;
    }
  }
`;

const ParticipantInfo = styled.div<{
  'data-is-fill': boolean | undefined;
}>`
  width: 100%;
  position: absolute;
  bottom: 0;
  color: ${white};
  padding: 4px 16px;
  box-sizing: border-box;
  display: grid;
  gap: 4px;
  background: ${blackSecondary};
  grid-template-columns: 1fr auto;

  &[data-is-fill] {
    background: ${black};
    top: 0;
    padding-top: 60px;
    gap: 16px;
    grid-template-columns: auto;
    grid-auto-rows: min-content;
    justify-content: center;
  }
`;

const OwnerRole = styled.div`
  position: absolute;
  z-index: 1;
  right: 0;
  top: 0;
  height: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 0 12px;
  box-sizing: border-box;
  background: ${blackSecondary};
`;

const UserName = styled.div`
  text-overflow: ellipsis;
  overflow-x: hidden;
  white-space: nowrap;
  text-align: left;
`;

const Indicators = styled.div`
  display: grid;
  gap: 4px;
  grid-template-columns: min-content min-content min-content;
  justify-content: center;
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

const Hand = styled(HandIcon)`
  height: 24px;
  width: 24px;
  color: #fff;
  padding: 12px;
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

    const { isRaisedHand } = useRaiseHand(room, participant.id);

    const isScreenShareShow =
      primaryVideoElement.source === 'display' &&
      !primaryVideoElement.isVideoMuted;

    const isVideoMuted =
      primaryVideoElement.source === 'user'
        ? primaryVideoElement.isVideoMuted
        : secondaryVideoElement.isVideoMuted;

    return (
      <Wrapper
        data-is-dominant={booleanAttribute(isDominantParticipantId)}
        ref={ref}
        {...otherProps}
      >
        <UpLeftContainer>
          {!isLocalParticipant && (
            <MuteButton participantId={participant.id} room={room} />
          )}
          {isRaisedHand && <Hand />}
          <ParticipantReaction room={room} participantId={participant.id} />
        </UpLeftContainer>
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
        <ParticipantInfo
          data-is-fill={booleanAttribute(primaryVideoElement.isVideoMuted)}
        >
          <UserName>{useName}</UserName>

          <Indicators>
            {isScreenShareShow && <IconDisplay color={white} />}
            {isVideoMuted ? (
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
        {participant.role === 'owner' && (
          <OwnerRole title="Owner">
            <IconPersoneCustom size="xs" color="inherit" />
          </OwnerRole>
        )}
        <ParticipantModeratorDropdownCustom
          participant={participant}
          isAudioMuted={isAudioMuted}
          isVideoMuted={isVideoMuted}
        />
      </Wrapper>
    );
  },
);
