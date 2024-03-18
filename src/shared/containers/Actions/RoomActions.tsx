import { FC, useCallback, useEffect } from 'react';

import { JazzRoom, ScreenShareUserCanceledError } from '@salutejs/jazz-sdk-web';
import { Button } from '@salutejs/plasma-b2c';
import {
  IconCallEnd,
  IconCameraVideo,
  IconDevice,
  IconDisplay,
  IconMic,
  IconMicOff,
  IconVideoOff,
} from '@salutejs/plasma-icons';
import { white } from '@salutejs/plasma-tokens';
import styled from 'styled-components/macro';

import { useGlobalContext } from '../../contexts/globalContext';
import { useParticipantMediaMuted } from '../../hooks/useParticipantMediaMuted';
import { useQuery } from '../../hooks/useQuery';
import { useRaiseHand } from '../../hooks/useRaiseHand';
import { useTimer } from '../../hooks/useTimer';
import { useUserPermissionRequestCheck } from '../../hooks/useUserPermissionRequestCheck';
import { HandIcon } from '../../icons/HandIcon';

const Hand = styled(HandIcon)<{ 'data-is-active': boolean | undefined }>`
  height: 24px;
  width: 24px;
  color: #000;
  &[data-is-active] {
    color: #fff;
  }
`;

const IconCallEndCustom = styled(IconCallEnd)`
  color: ${white};
`;

const RequestPermissionPopoverContent = styled.div`
  display: none;
  position: absolute;
  top: 0px;
  left: 50%;
  transform: translate(-50%, -100%);
  padding: 8px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0px 4px 10px rgb(0 0 0 / 22%);
`;

const RequestPermissionPopover = styled.div`
  position: relative;

  &:hover {
    ${RequestPermissionPopoverContent} {
      display: block;
    }
  }
`;

export const RoomActions: FC<{ room: JazzRoom; isShowRaiseHand?: boolean }> = ({
  room,
  isShowRaiseHand = false,
}) => {
  const localParticipant = useQuery(room.localParticipant);

  const { isAudioMuted, isDisplayMuted, isVideoMuted } =
    useParticipantMediaMuted(room, localParticipant);

  const handleLeave = useCallback(() => {
    room.leave();
  }, [room]);

  const { isRaisedHand, activity } = useRaiseHand(room);

  const handleRaiseHand = useCallback(async () => {
    activity.raiseHand(!isRaisedHand);
  }, [activity, isRaisedHand]);

  return (
    <>
      {isShowRaiseHand && (
        <Button
          contentLeft={<Hand data-is-active={isRaisedHand || undefined} />}
          pin="circle-circle"
          view={isRaisedHand ? 'primary' : 'secondary'}
          aria-label="raise hand"
          title="raise hand"
          onClick={handleRaiseHand}
        />
      )}
      <RequestPermissionVideo isVideoMuted={isVideoMuted} room={room} />
      <Button
        contentLeft={<IconCallEndCustom color="inherit" />}
        view="critical"
        pin="circle-circle"
        aria-label="leave"
        title="leave"
        onClick={handleLeave}
      />
      <RequestPermissionAudio isAudioMuted={isAudioMuted} room={room} />
      <RequestPermissionDisplay isDisplayMuted={isDisplayMuted} room={room} />
    </>
  );
};

const RequestPermissionDisplay: FC<{
  isDisplayMuted: boolean;
  room: JazzRoom;
}> = ({ room, isDisplayMuted }) => {
  const requests = useQuery(room.userPermissionRequests);
  const { eventBus } = useGlobalContext();
  const permissions = useQuery(room.userPermissions);

  const { leftTime, permissionRequestCheck } =
    useUserPermissionRequestCheck(room);

  const handlePermissionRequestCheck = useCallback(() => {
    permissionRequestCheck('canShareMedia');
  }, [permissionRequestCheck]);

  const timeValue = useTimer({
    onSubmit: handlePermissionRequestCheck,
    remainingTime: leftTime,
  });

  const handleRequestPermissionMedia = useCallback(() => {
    room.requestPermission('canShareMedia');
    handlePermissionRequestCheck();
  }, [room, handlePermissionRequestCheck]);

  useEffect(() => {
    handlePermissionRequestCheck();
  }, [handlePermissionRequestCheck]);

  const handleToggleShare = useCallback(async () => {
    try {
      await room.muteDisplayVideoInput(!isDisplayMuted);
    } catch (error) {
      if (error instanceof ScreenShareUserCanceledError) {
        return;
      }
      console.error(error);
      eventBus({
        type: 'error',
        payload: { title: 'Fail toggle screen capture' },
      });
    }
  }, [room, eventBus, isDisplayMuted]);

  const isDisabled = isDisplayMuted && !permissions?.canShareMedia;
  const isActiveRequestPermission =
    isDisabled && permissions?.canRequestPermission;
  const permission = requests.get('canShareMedia');
  const isSended = permission && !permission.canRequestAgain;

  return (
    <RequestPermissionPopover>
      <Button
        contentLeft={isDisplayMuted ? <IconDisplay /> : <IconDevice />}
        pin="circle-circle"
        disabled={isDisabled}
        aria-label="Toggle screen capture"
        title="Toggle screen capture"
        onClick={handleToggleShare}
      />
      {isActiveRequestPermission && (
        <RequestPermissionPopoverContent>
          <Button
            contentLeft={<IconDisplay color="#fff" />}
            pin="circle-circle"
            size="s"
            aria-label="Request permission canShareMedia"
            title="Request permission canShareMedia"
            disabled={isSended}
            text={
              isSended
                ? `Retry request after: ${timeValue}`
                : 'Request permission'
            }
            view="primary"
            onClick={handleRequestPermissionMedia}
          />
        </RequestPermissionPopoverContent>
      )}
    </RequestPermissionPopover>
  );
};

const RequestPermissionAudio: FC<{
  isAudioMuted: boolean;
  room: JazzRoom;
}> = ({ room, isAudioMuted }) => {
  const requests = useQuery(room.userPermissionRequests);
  const { eventBus } = useGlobalContext();
  const permissions = useQuery(room.userPermissions);

  const { leftTime, permissionRequestCheck } =
    useUserPermissionRequestCheck(room);

  const handlePermissionRequestCheck = useCallback(() => {
    permissionRequestCheck('canShareAudio');
  }, [permissionRequestCheck]);

  const timeValue = useTimer({
    onSubmit: handlePermissionRequestCheck,
    remainingTime: leftTime,
  });

  const handleRequestPermissionMedia = useCallback(() => {
    room.requestPermission('canShareAudio');
    handlePermissionRequestCheck();
  }, [room, handlePermissionRequestCheck]);

  useEffect(() => {
    handlePermissionRequestCheck();
  }, [handlePermissionRequestCheck]);

  const handleToggleShare = useCallback(async () => {
    try {
      await room.muteAudioInput(!isAudioMuted);
    } catch (error) {
      console.error(error);
      eventBus({ type: 'error', payload: { title: 'Fail toggle mic' } });
    }
  }, [room, eventBus, isAudioMuted]);

  const isDisabled = isAudioMuted && !permissions?.canShareAudio;
  const isActiveRequestPermission =
    isDisabled && permissions?.canRequestPermission;
  const permission = requests.get('canShareAudio');
  const isSended = permission && !permission.canRequestAgain;

  return (
    <RequestPermissionPopover>
      <Button
        contentLeft={isAudioMuted ? <IconMicOff /> : <IconMic />}
        pin="circle-circle"
        aria-label="Toggle mic"
        disabled={isDisabled}
        title="Toggle mic"
        onClick={handleToggleShare}
      />
      {isActiveRequestPermission && (
        <RequestPermissionPopoverContent>
          <Button
            contentLeft={<IconMic color="#fff" />}
            pin="circle-circle"
            size="s"
            aria-label="Request permission canShareAudio"
            title="Request permission canShareAudio"
            disabled={isSended}
            text={
              isSended
                ? `Retry request after: ${timeValue}`
                : 'Request permission'
            }
            view="primary"
            onClick={handleRequestPermissionMedia}
          />
        </RequestPermissionPopoverContent>
      )}
    </RequestPermissionPopover>
  );
};

const RequestPermissionVideo: FC<{
  isVideoMuted: boolean;
  room: JazzRoom;
}> = ({ room, isVideoMuted }) => {
  const requests = useQuery(room.userPermissionRequests);
  const { eventBus } = useGlobalContext();
  const permissions = useQuery(room.userPermissions);

  const { leftTime, permissionRequestCheck } =
    useUserPermissionRequestCheck(room);

  const handlePermissionRequestCheck = useCallback(() => {
    permissionRequestCheck('canShareCamera');
  }, [permissionRequestCheck]);

  const timeValue = useTimer({
    onSubmit: handlePermissionRequestCheck,
    remainingTime: leftTime,
  });

  const handleRequestPermissionMedia = useCallback(() => {
    room.requestPermission('canShareCamera');
    handlePermissionRequestCheck();
  }, [room, handlePermissionRequestCheck]);

  useEffect(() => {
    handlePermissionRequestCheck();
  }, [handlePermissionRequestCheck]);

  const handleToggleShare = useCallback(async () => {
    try {
      await room.muteVideoInput(!isVideoMuted);
    } catch (error) {
      console.error(error);
      eventBus({ type: 'error', payload: { title: 'Fail toggle camera' } });
    }
  }, [room, eventBus, isVideoMuted]);

  const isDisabled = isVideoMuted && !permissions?.canShareCamera;
  const isActiveRequestPermission =
    isDisabled && permissions?.canRequestPermission;
  const permission = requests.get('canShareCamera');
  const isSended = permission && !permission.canRequestAgain;

  return (
    <RequestPermissionPopover>
      <Button
        contentLeft={isVideoMuted ? <IconVideoOff /> : <IconCameraVideo />}
        pin="circle-circle"
        aria-label="Toggle camera"
        disabled={isDisabled}
        title="Toggle camera"
        onClick={handleToggleShare}
      />
      {isActiveRequestPermission && (
        <RequestPermissionPopoverContent>
          <Button
            contentLeft={<IconCameraVideo color="#fff" />}
            pin="circle-circle"
            size="s"
            aria-label="Request permission canShareCamera"
            title="Request permission canShareCamera"
            disabled={isSended}
            text={
              isSended
                ? `Retry request after: ${timeValue}`
                : 'Request permission'
            }
            view="primary"
            onClick={handleRequestPermissionMedia}
          />
        </RequestPermissionPopoverContent>
      )}
    </RequestPermissionPopover>
  );
};
