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

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
`;

const ConferenceInfoWrapper = styled.div`
  display: flex;
  gap: 16px;
`;

const Footer = styled.div`
  display: grid;
  gap: 16px;
  grid-auto-flow: column;
  align-items: center;
`;

export type JoinToConferenceModalForm = {
  password: string;
  roomId: string;
  userName: string;
  muted: boolean;
};

export type JoinToConferenceModalProps = {
  isOpen: boolean;
  client: JazzClient;
  onJoin: (form: JoinToConferenceModalForm) => void;
  onClose: () => void;
};

function getInitialState(): JoinToConferenceModalForm {
  return {
    password: '',
    roomId: '',
    userName: '',
    muted: true,
  };
}

export const JoinToConferenceModal: FC<JoinToConferenceModalProps> = ({
  isOpen,
  onClose,
  client,
  onJoin,
}) => {
  const [form, setForm] =
    useState<JoinToConferenceModalForm>(getInitialState());

  const userInfo = useQuery(client.auth.userInfo);

  const isAuthorised = useQuery(client.auth.isAuthorised);

  const [errors, setErrors] = useState<ValidateReport>({});

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleChangeField = useCallback(
    (
      event: ChangeEvent<HTMLInputElement>,
      field: keyof JoinToConferenceModalForm,
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

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();

      const errors = validateConferenceForm(
        form,
        client.auth.isAuthorised.get() ? ['userName'] : [],
      );

      if (Object.keys(errors).length) {
        setErrors(errors);
        return;
      }

      onJoin(form);

      handleClose();
    },
    [handleClose, form, onJoin, client],
  );

  const handleMediaEnabled = useCallback(() => {
    setForm((form) => ({
      ...form,
      muted: !form.muted,
    }));
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Headline3>Join the meeting</Headline3>

      <StyledForm onSubmit={handleSubmit}>
        {isAuthorised ? (
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
        )}
        <ConferenceInfoWrapper>
          <TextField
            name="conferenceId"
            value={form.roomId}
            view="innerLabel"
            label="Room id"
            onChange={(event) => handleChangeField(event, 'roomId')}
            helperText={errors.roomId}
            status={errors.roomId ? 'error' : undefined}
          />
          <TextField
            value={form.password}
            name="password"
            view="innerLabel"
            label="Password"
            onChange={(event) => handleChangeField(event, 'password')}
            helperText={errors.password}
            status={errors.password ? 'error' : undefined}
          />
        </ConferenceInfoWrapper>
        <Checkbox
          label="Join with enabled microphone and camera"
          checked={!form.muted}
          onChange={handleMediaEnabled}
        />

        <Footer>
          <Button type="submit" view="accent">
            Join the meeting
          </Button>
        </Footer>
      </StyledForm>
    </Modal>
  );
};
