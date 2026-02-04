import {
  ChangeEvent,
  FC,
  FormEventHandler,
  useCallback,
  useState,
} from 'react';

import { JazzClient } from '@salutejs/jazz-sdk-web';
import { Button, Checkbox, Headline3, TextField } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { Modal } from '../../../../shared/components/Modal';
import { useQuery } from '../../../../shared/hooks/useQuery';
import {
  validateConferenceForm,
  ValidateReport,
} from '../../../../shared/utils/conferenceValidations';

const CustomModal = styled(Modal)`
  width: 400px;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
`;

export type CreateConferenceForm = {
  conferenceName: string;
  connectToConference: boolean;
  isLobbyEnabled: boolean;
  isGuestEnabled: boolean;
  userName: string;
  muted: boolean;
};

type CreateConferenceModalProps = {
  isOpen: boolean;
  client: JazzClient;
  onClose: () => void;
  onCreate: (form: CreateConferenceForm) => void;
};

function getInitialFormState(): CreateConferenceForm {
  return {
    conferenceName: 'Video meeting',
    connectToConference: true,
    isLobbyEnabled: false,
    isGuestEnabled: true,
    userName: '',
    muted: true,
  };
}

export const CreateConferenceModal: FC<CreateConferenceModalProps> = ({
  client,
  isOpen,
  onClose,
  onCreate,
}) => {
  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <Content client={client} onCreate={onCreate} />
    </CustomModal>
  );
};

const Content: FC<{
  client: JazzClient;
  onCreate: (form: CreateConferenceForm) => void;
}> = ({ client, onCreate }) => {
  const [form, setForm] = useState<CreateConferenceForm>(getInitialFormState());

  const [errors, setErrors] = useState<ValidateReport>({});

  const userInfo = useQuery(client.auth.userInfo);

  const isAuthorised = useQuery(client.auth.isAuthorised);

  const handleChangeField = useCallback(
    (
      event: ChangeEvent<HTMLInputElement>,
      field: keyof CreateConferenceForm,
    ) => {
      setErrors((errors) => ({
        ...errors,
        [field]: undefined,
      }));

      const value = event.target.value;

      setForm((form) => ({
        ...form,
        [field]: value,
      }));
    },
    [],
  );

  const handleChangeConnectToConference = useCallback(() => {
    setForm((form) => ({
      ...form,
      connectToConference: !form.connectToConference,
    }));
  }, []);

  const handleEnableLobby = useCallback(() => {
    setForm((form) => ({
      ...form,
      isLobbyEnabled: !form.isLobbyEnabled,
    }));
  }, []);

  const handleEnableGuest = useCallback(() => {
    setForm((form) => ({
      ...form,
      isGuestEnabled: !form.isGuestEnabled,
    }));
  }, []);

  const handleMediaEnabled = useCallback(() => {
    setForm((form) => ({
      ...form,
      muted: !form.muted,
    }));
  }, []);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();

      const errors = validateConferenceForm(
        {
          conferenceName: form.conferenceName,
          userName: form.userName,
        },
        client.auth.isAuthorised.get() ? ['userName'] : [],
      );

      if (Object.keys(errors).length) {
        setErrors(errors);
        return;
      }

      onCreate(form);
    },
    [form, onCreate, client],
  );

  return (
    <>
      <Headline3>Create conference</Headline3>
      <StyledForm onSubmit={handleSubmit}>
        <TextField
          value={form.conferenceName}
          caption="Meeting name"
          onChange={(event) => handleChangeField(event, 'conferenceName')}
          helperText={errors.conferenceName}
          status={errors.conferenceName ? 'error' : undefined}
        />
        {form.connectToConference &&
          (isAuthorised ? (
            <TextField
              value={userInfo?.name}
              label="User name"
              view="innerLabel"
              readOnly
              helperText={errors.userName}
              status={errors.userName ? 'error' : undefined}
            />
          ) : (
            <TextField
              value={form.userName}
              label="User name"
              view="innerLabel"
              onChange={(event) => handleChangeField(event, 'userName')}
              helperText={errors.userName}
              status={errors.userName ? 'error' : undefined}
            />
          ))}
        <Checkbox
          label="Connect to meeting"
          checked={form.connectToConference}
          onChange={handleChangeConnectToConference}
        />
        {isAuthorised && (
          <>
            <Checkbox
              label="Enable guest"
              checked={form.isGuestEnabled}
              onChange={handleEnableGuest}
            />
            <Checkbox
              label="Enable lobby"
              checked={form.isLobbyEnabled}
              onChange={handleEnableLobby}
            />
          </>
        )}
        <Checkbox
          label="Join with enabled microphone and camera"
          checked={!form.muted}
          onChange={handleMediaEnabled}
        />

        <Button type="submit" view="accent">
          Create meeting
        </Button>
      </StyledForm>
    </>
  );
};
