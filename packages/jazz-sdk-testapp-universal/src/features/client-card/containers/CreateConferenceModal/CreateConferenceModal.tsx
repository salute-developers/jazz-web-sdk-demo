import {
  ChangeEvent,
  FC,
  FormEventHandler,
  useCallback,
  useState,
} from 'react';

import { JazzClient } from '@salutejs/jazz-sdk-web';
import {
  Button,
  Checkbox,
  Headline3,
  Modal,
  TextField,
} from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { useQuery } from '../../../../shared/hooks/useQuery';
import {
  validateConferenceForm,
  ValidateReport,
} from '../../../../shared/utils/conferenceValidations';

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
  jazzNextOnly: boolean;
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
    jazzNextOnly: false,
  };
}

export const CreateConferenceModal: FC<CreateConferenceModalProps> = ({
  client,
  isOpen,
  onClose,
  onCreate,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Content client={client} onCreate={onCreate} />
    </Modal>
  );
};

const Content: FC<{
  client: JazzClient;
  onCreate: (form: CreateConferenceForm) => void;
}> = ({ client, onCreate }) => {
  const [form, setForm] = useState<CreateConferenceForm>(getInitialFormState());

  const [errors, setErrors] = useState<ValidateReport>({});

  const userInfo = useQuery(client.auth.userInfo);

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

  const handleChangeIsJazzNext = useCallback(() => {
    setForm((form) => ({
      ...form,
      jazzNextOnly: !form.jazzNextOnly,
    }));
  }, []);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();

      const errors = validateConferenceForm({
        conferenceName: form.conferenceName,
      });

      if (Object.keys(errors).length) {
        setErrors(errors);
        return;
      }

      onCreate(form);
    },
    [form, onCreate],
  );

  return (
    <>
      <Headline3>Create conference</Headline3>
      <StyledForm onSubmit={handleSubmit}>
        <TextField
          value={form.conferenceName}
          caption="Conference name"
          onChange={(event) => handleChangeField(event, 'conferenceName')}
          helperText={errors.conferenceName}
          status={errors.conferenceName ? 'error' : undefined}
        />
        {form.connectToConference && (
          <TextField
            value={userInfo?.name}
            caption="Username"
            disabled
            label="User name"
          />
        )}
        <Checkbox
          label="Connect to conference"
          checked={form.connectToConference}
          onChange={handleChangeConnectToConference}
        />
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
        <Checkbox
          label="JazzNext conference"
          checked={form.jazzNextOnly}
          onChange={handleChangeIsJazzNext}
        />
        <Button type="submit" view="primary">
          Create conference
        </Button>
      </StyledForm>
    </>
  );
};
