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
import { useQuery } from 'rx-effects-react';
import styled from 'styled-components/macro';

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
  };
}

export const CreateConferenceModal: FC<CreateConferenceModalProps> = ({
  client,
  isOpen,
  onClose,
  onCreate,
}) => {
  const [form, setForm] = useState<CreateConferenceForm>(getInitialFormState());

  const [errors, setErrors] = useState<ValidateReport>({});

  const userInfo = useQuery(client.auth.userInfo);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

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
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Headline3>Create conference</Headline3>
      <StyledForm onSubmit={handleSubmit}>
        <TextField
          value={form.conferenceName}
          label="Conference name"
          onChange={(event) => handleChangeField(event, 'conferenceName')}
          helperText={errors.conferenceName}
          status={errors.conferenceName ? 'error' : undefined}
        />
        {form.connectToConference && (
          <TextField value={userInfo?.name} readOnly label="User name" />
        )}
        <Checkbox
          label="connect to conference"
          checked={form.connectToConference}
          onChange={handleChangeConnectToConference}
        />
        <Button type="submit" view="primary">
          Create conference
        </Button>
      </StyledForm>
    </Modal>
  );
};
