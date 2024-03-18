import {
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  handleEvent,
  JazzRoom,
  JazzRoomParticipantId,
} from '@salutejs/jazz-sdk-web';
import { getAudioOutputMixerManager } from '@salutejs/jazz-sdk-web-plugins';
import { Button } from '@salutejs/plasma-b2c';
import { IconProps, IconVolumeOff, IconVolumeUp } from '@salutejs/plasma-icons';
import { white } from '@salutejs/plasma-tokens';
import styled from 'styled-components/macro';

const Action = styled(Button)``;

const IconVolume: FC<{
  isAllMuted: boolean;
  iconColor?: IconProps['color'];
}> = ({ iconColor = white, isAllMuted }) => {
  if (isAllMuted) return <IconVolumeOff color={iconColor} />;

  return <IconVolumeUp color={iconColor} />;
};

export const MuteButton = forwardRef<
  HTMLButtonElement,
  {
    room: JazzRoom;
    participantId: JazzRoomParticipantId;
    className?: string;
    iconColor?: IconProps['color'];
  }
>((props, ref) => {
  const { room, children, participantId, iconColor, ...otherProps } = props;
  const [isMuted, setIsMuted] = useState(false);

  const audioOutputMixerManger = useMemo(() => {
    return getAudioOutputMixerManager(room);
  }, [room]);

  useEffect(() => {
    setIsMuted(
      audioOutputMixerManger.mutedParticipants.get().has(participantId),
    );

    const unsubscribe = handleEvent(
      audioOutputMixerManger.event$,
      'muteParticipantsChanged',
      ({ payload }) => {
        if (payload.participantIds.some((id) => participantId === id)) {
          setIsMuted(payload.isMuted);
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, [room, audioOutputMixerManger, participantId]);

  const handleMuteChange = useCallback(() => {
    audioOutputMixerManger.muteParticipants(!isMuted, [participantId]);
  }, [isMuted, audioOutputMixerManger, participantId]);

  return (
    <Action
      {...otherProps}
      ref={ref}
      title="mute audio"
      aria-label="mute audio"
      view="clear"
      contentLeft={<IconVolume isAllMuted={isMuted} iconColor={iconColor} />}
      onClick={handleMuteChange}
    />
  );
});
