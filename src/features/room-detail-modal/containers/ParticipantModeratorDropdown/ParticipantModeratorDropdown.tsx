import { forwardRef, useCallback, useMemo } from 'react';

import { JazzRoomParticipant } from '@salutejs/jazz-sdk-web';
import { Button, Dropdown, DropdownNodeType } from '@salutejs/plasma-b2c';
import { IconMoreVertical } from '@salutejs/plasma-icons';
import styled from 'styled-components/macro';

import { useQuery } from '../../../../shared/hooks/useQuery';
import { useRoomContext } from '../../contexts/roomContext';

const ButtonCustom = styled(Button)`
  padding: 12px;
  height: 48px;
  color: #fff;

  &:hover {
    color: #fff;
  }
`;

type ParticipantProps = {
  className?: string;
  participant: JazzRoomParticipant;
  isVideoMuted: boolean;
  isAudioMuted: boolean;
};

const ModeratorDropdown = forwardRef<HTMLButtonElement, ParticipantProps>(
  (props, ref) => {
    const { participant, isVideoMuted, isAudioMuted } = props;
    const { room } = useRoomContext();

    const userPermissions = useQuery(room.userPermissions);

    const items = useMemo((): DropdownNodeType[] => {
      const items: DropdownNodeType[] = [];

      if (userPermissions?.canMuteUser) {
        items.push(
          {
            label: 'Disable audio',
            value: 'turnOffAudio',
            isDisabled: isAudioMuted,
          },
          {
            label: 'Disable video',
            value: 'turnOffVideo',
            isDisabled: isVideoMuted,
          },
        );
      }

      if (userPermissions?.canKickUser) {
        items.push({
          label: 'Kick',
          value: 'kick',
        });
      }
      return items;
    }, [isVideoMuted, isAudioMuted, userPermissions]);

    const handleItemSelect = useCallback(
      (value: DropdownNodeType) => {
        if (value.value === 'turnOffAudio') {
          room.moderator.muteUsers(participant.id, 'audio');

          return;
        }

        if (value.value === 'turnOffVideo') {
          room.moderator.muteUsers(participant.id, 'video');

          return;
        }

        if (value.value === 'kick') {
          room.moderator.kickUsers(participant.id);

          return;
        }
      },
      [room, participant],
    );

    if (!items.length) {
      return null;
    }

    return (
      <Dropdown
        items={items}
        onItemSelect={handleItemSelect}
        placement={'left'}
        {...props}
      >
        <ButtonCustom ref={ref}>
          <IconMoreVertical color="inherit" />
        </ButtonCustom>
      </Dropdown>
    );
  },
);

export type ParticipantModeratorDropdownProps = {
  className?: string;
  participant: JazzRoomParticipant;
  isVideoMuted: boolean;
  isAudioMuted: boolean;
};
export const ParticipantModeratorDropdown = forwardRef<
  HTMLButtonElement,
  ParticipantModeratorDropdownProps
>((props, ref) => {
  const { room } = useRoomContext();
  const localParticipant = useQuery(room.localParticipant);

  if (!localParticipant || localParticipant.role !== 'owner') {
    return null;
  }

  if (localParticipant.id === props.participant.id) {
    return null;
  }

  return <ModeratorDropdown ref={ref} {...props} />;
});
