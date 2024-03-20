import {
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { handleEvent, JazzRoom } from '@salutejs/jazz-sdk-web';
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

export const GlobalMute = forwardRef<
  HTMLButtonElement,
  { room: JazzRoom; className?: string; iconColor?: IconProps['color'] }
>((props, ref) => {
  const { room, children, iconColor, ...otherProps } = props;
  const [isAllMuted, setIsAllMuted] = useState(false);

  const audioOutputMixerManger = useMemo(() => {
    return getAudioOutputMixerManager(room);
  }, [room]);

  useEffect(() => {
    setIsAllMuted(audioOutputMixerManger.isMutedAll.get());

    const unsubscribe = handleEvent(
      audioOutputMixerManger.event$,
      'muteAllParticipantsChanged',
      ({ payload }) => {
        setIsAllMuted(payload.isMuted);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [room, audioOutputMixerManger]);

  const handleMuteChange = useCallback(() => {
    audioOutputMixerManger.muteAllParticipants(!isAllMuted);
  }, [isAllMuted, audioOutputMixerManger]);

  return (
    <Action
      {...otherProps}
      ref={ref}
      title="mute audio"
      aria-label="mute audio"
      view="clear"
      contentLeft={<IconVolume isAllMuted={isAllMuted} iconColor={iconColor} />}
      onClick={handleMuteChange}
    />
  );
});
