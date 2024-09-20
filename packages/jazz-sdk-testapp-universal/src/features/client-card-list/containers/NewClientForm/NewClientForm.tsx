import {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  useCallback,
  useState,
} from 'react';

import { createJazzClient, createSdkToken } from '@salutejs/jazz-sdk-web';
import { Body2, Button, TextField } from '@salutejs/plasma-b2c';
import { firstValueFrom, map } from 'rxjs';
import styled from 'styled-components/macro';

import { CLIENT_VALUE_KEY } from '../../../../shared/constants';
import { useClientsContext } from '../../../../shared/contexts/clientsContext';
import { useGlobalContext } from '../../../../shared/contexts/globalContext';
import { validateURL } from '../../../../shared/utils/validateURL';

const Title = styled(Body2)`
  margin-bottom: 8px;
`;

const StyledTextField = styled(TextField)`
  width: 500px;
`;

const FieldWrapper = styled.form`
  display: flex;
  gap: 16px;
`;

export const NewClientForm: FC = () => {
  const { sdk, eventBus } = useGlobalContext();
  const { clients$ } = useClientsContext();

  const [host, setHost] = useState(
    sessionStorage.getItem(CLIENT_VALUE_KEY) || '',
  );
  const [hostError, setHostError] = useState('');

  const [status, setStatus] = useState<
    'idle' | 'failure' | 'success' | 'pending'
  >('idle');

  const createClient = useCallback(
    async (host: string) => {
      if (!sdk) return;
      setStatus('pending');
      try {
        const jazzClient = await createJazzClient(sdk, {
          serverUrl: host,
          authProvider: {
            handleUnauthorizedError: async ({ loginBySdkToken }) => {
              const state = await firstValueFrom(
                clients$.pipe(map((clients) => clients.get(jazzClient))),
              );
              if (!state || !state.sdkTokenState) {
                return 'fail';
              }

              const { iss, value, sub, userName } = state.sdkTokenState;
              try {
                const { sdkToken } = await createSdkToken(value, {
                  iss,
                  userName,
                  sub,
                });

                await loginBySdkToken(sdkToken);

                return 'retry';
              } catch (error) {
                console.log(
                  'Failed to refresh authenticate by sdk token',
                  error,
                );
                return 'fail';
              }
            },
          },
        });

        console.log('Created JazzClient');
        setStatus('success');
      } catch (error) {
        eventBus({
          type: 'error',
          payload: { title: 'Error create JazzClient' },
        });
        setStatus('failure');
      }
    },
    [sdk, eventBus, clients$],
  );

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const value = event.target.value;

      setHost(value);
      sessionStorage.setItem(CLIENT_VALUE_KEY, value);
      setHostError('');
    },
    [],
  );

  const handleCreateClient = useCallback(async () => {
    if (!host) {
      setHostError('host is empty');
      return;
    }

    if (!validateURL(host)) {
      setHostError('Invalid url address');
      return;
    }

    await createClient(host);
    setHost('');
  }, [host, createClient]);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();

      handleCreateClient();
    },
    [handleCreateClient],
  );

  const isPending = status === 'pending';

  return (
    <div>
      <Title>Create new JazzClient</Title>
      <FieldWrapper onSubmit={handleSubmit}>
        <StyledTextField
          label="Host url"
          onChange={handleChange}
          value={host}
          helperText={hostError}
          status={hostError ? 'error' : undefined}
        />
        <Button
          type="submit"
          disabled={isPending}
          isLoading={isPending}
          view="primary"
        >
          Create JazzClient
        </Button>
      </FieldWrapper>
    </div>
  );
};
