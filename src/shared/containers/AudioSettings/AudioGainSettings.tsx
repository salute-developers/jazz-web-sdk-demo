import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { handleEvent } from '@salutejs/jazz-sdk-web';
import {
  AUDIO_GAIN_DEFAULT,
  getAudioOutputMixer,
  MAX_AUDIO_GAIN_VALUE,
  MIN_AUDIO_GAIN_VALUE,
} from '@salutejs/jazz-sdk-web-plugins';
import { Body2, TextField } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { AUDIO_GAIN_KEY } from '../../constants';
import { useGlobalContext } from '../../contexts/globalContext';

const Title = styled(Body2)`
  margin-bottom: 16px;
`;

export const AudioGainSettings: FC = () => {
  const { sdk } = useGlobalContext();

  const audioOutputMixer = useMemo(() => {
    if (!sdk) return undefined;

    return getAudioOutputMixer(sdk);
  }, [sdk]);

  const [outputGain, setOutputGain] = useState<number>(AUDIO_GAIN_DEFAULT);

  useEffect(() => {
    if (!audioOutputMixer) return;

    const initOutputGain = audioOutputMixer.outputGain.get();
    const storageOutputGain = Number(localStorage.getItem(AUDIO_GAIN_KEY));

    if (storageOutputGain) {
      audioOutputMixer.setOutputGain(storageOutputGain);
      setOutputGain(storageOutputGain);
    } else {
      setOutputGain(initOutputGain);
    }

    const unsubscribe = handleEvent(
      audioOutputMixer.event$,
      'gainChanged',
      ({ payload }) => {
        setOutputGain(payload.value);
        localStorage.setItem(AUDIO_GAIN_KEY, payload.value.toString());
      },
    );

    return () => {
      unsubscribe();
    };
  }, [audioOutputMixer]);

  const handleChangeGain = useCallback(
    (value: string) => {
      if (!audioOutputMixer) return;

      audioOutputMixer.setOutputGain(Number(value) || 0);
    },
    [audioOutputMixer],
  );

  return (
    <div>
      <Title>Select audio output gain</Title>

      <TextField
        type="number"
        min={MIN_AUDIO_GAIN_VALUE}
        max={MAX_AUDIO_GAIN_VALUE}
        value={outputGain}
        step={0.2}
        helperText="output audio gain (0 - 10)"
        onChange={(event) => handleChangeGain(event.target.value)}
      />
    </div>
  );
};
