import { forwardRef, useMemo, useRef, useState } from 'react';

import { JazzRoomParticipant } from '@salutejs/jazz-sdk-web';
import { Button, Popover, useForkRef } from '@salutejs/plasma-b2c';
import { IconMoreVertical } from '@salutejs/plasma-icons';
import styled from 'styled-components/macro';

import { useQuery } from '../../../../shared/hooks/useQuery';
import { useRoomContext } from '../../contexts/roomContext';

const ButtonCustom = styled(Button)`
  padding: 12px;
  height: 48px;
  color: #fff;
  background: #fff0;

  &:hover {
    color: #fff;
    background: #fff0;
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
    const { participant, isVideoMuted, isAudioMuted, ...otherProps } = props;
    const { room } = useRoomContext();
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLButtonElement>(null);
    const buttonRef = useForkRef(
      ref,
      rootRef,
    ) as React.RefObject<HTMLButtonElement>;

    const userPermissions = useQuery(room.userPermissions);

    const items = useMemo((): DropdownNodeType[] => {
      const items: DropdownNodeType[] = [];

      if (userPermissions?.canMuteUser) {
        items.push(
          {
            label: 'Disable audio',
            value: 'turnOffAudio',
            isDisabled: isAudioMuted,
            onClick: () => {
              room.moderator.muteUsers(participant.id, 'audio');
            },
          },
          {
            label: 'Disable video',
            value: 'turnOffVideo',
            isDisabled: isVideoMuted,
            onClick: () => {
              room.moderator.muteUsers(participant.id, 'video');
            },
          },
        );
      }

      if (userPermissions?.canKickUser) {
        items.push({
          label: 'Kick',
          value: 'kick',
          onClick: () => {
            room.moderator.kickUsers(participant.id);
          },
        });
      }
      return items;
    }, [isVideoMuted, isAudioMuted, userPermissions, room, participant]);

    if (!items.length) {
      return null;
    }

    return (
      <div {...otherProps}>
        <ButtonCustom
          ref={rootRef}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen((state) => !state);
          }}
        >
          <IconMoreVertical color="inherit" />
        </ButtonCustom>
        <Popover
          placement="left"
          target={buttonRef}
          opened={isOpen}
          usePortal={true}
          onToggle={(open) => {
            setIsOpen(open);
          }}
          closeOnOverlayClick
          closeOnEsc
        >
          <MenuRoot>
            {items.map((item, i) => {
              return (
                <MenuItem key={item.value} {...item} autoFocus={i === 0} />
              );
            })}
          </MenuRoot>
        </Popover>
      </div>
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

const MenuRoot = styled.div`
  padding: 4px;
  background: #fff;
  border-radius: 16px;
  max-width: 180px;
`;

const RootButton = styled(Button)``;

type DropdownNodeType = {
  onClick: () => void;
  value: string;
  label: string;
  isDisabled?: boolean;
};

const MenuItem = (item: DropdownNodeType & { autoFocus?: boolean }) => {
  return (
    <RootButton
      view="clear"
      stretch={true}
      onClick={item.onClick}
      disabled={item.isDisabled}
      autoFocus={item.autoFocus}
    >
      {item.label}
    </RootButton>
  );
};
