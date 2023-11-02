import { FC, useCallback, useEffect, useState } from 'react';

import { handleEvent, JazzLobby, JazzRoom } from '@salutejs/jazz-sdk-web';
import { Body2, Button } from '@salutejs/plasma-b2c';
import { IconCallEnd } from '@salutejs/plasma-icons';
import { buttonWarning, tertiary } from '@salutejs/plasma-tokens-b2c';
import { useQuery } from 'rx-effects-react';
import styled from 'styled-components/macro';

const Wrapper = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: ${buttonWarning};
`;

const ConnectionPlaceHolder = styled.div`
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 4px;

  > ${Body2} {
    padding: 4px;
    background: #fff;
    border-radius: 8px;
  }
`;

const Message = styled.div`
  height: 142px;
  width: 100%;
  position: relative;
  padding: 0 32px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  text-align: center;
  color: #fff;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${tertiary};
  padding: 8px 0;
`;

export const LobbyCard: FC<{
  room: JazzRoom;
  lobby: JazzLobby;
  onHide: () => void;
}> = ({ room, lobby, onHide }) => {
  const status = useQuery(lobby.status);

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const unsubscribeError = handleEvent(
      lobby.event$,
      'error',
      ({ payload: { error } }) => {
        if (error.type === 'AccessDeniedError') {
          setErrorMessage('Access denied');
          return;
        }

        setErrorMessage('Unknown error');
      },
    );

    const unsubscribeAccessGranted = handleEvent(
      lobby.event$,
      'accessGranted',
      () => {
        onHide();
      },
    );

    return () => {
      unsubscribeError();
      unsubscribeAccessGranted();
    };
  }, [lobby, onHide]);

  const handleLeave = useCallback(() => {
    room.leave();
  }, [room]);

  return (
    <Wrapper>
      {status === 'connecting' && (
        <ConnectionPlaceHolder>
          <Body2>connecting....</Body2>
        </ConnectionPlaceHolder>
      )}
      {status === 'disconnecting' && (
        <ConnectionPlaceHolder>
          <Body2>disconnecting....</Body2>
        </ConnectionPlaceHolder>
      )}
      {status === 'error' && (
        <ConnectionPlaceHolder>
          <Body2>{errorMessage}</Body2>
          <Button view="critical" onClick={() => room.leave()}>
            Remove
          </Button>
        </ConnectionPlaceHolder>
      )}
      <Message>Wait, the organizer will let you in soon</Message>
      <Actions>
        <Button
          contentLeft={<IconCallEnd />}
          view="critical"
          pin="circle-circle"
          aria-label="leave"
          title="leave"
          onClick={handleLeave}
        />
      </Actions>
    </Wrapper>
  );
};
