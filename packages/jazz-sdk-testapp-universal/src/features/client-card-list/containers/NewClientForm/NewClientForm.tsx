import {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  useCallback,
  useState,
} from 'react';

import { createJazzClient } from '@salutejs/jazz-sdk-web';
import { Body2, Button, TextField } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { CLIENT_VALUE_KEY } from '../../../../shared/constants';
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
        await createJazzClient(sdk, {
          serverUrl: host,
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
    [sdk, eventBus],
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
