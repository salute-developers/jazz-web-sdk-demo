import { useCallback, useEffect, useState } from 'react';

const REFRESH_INTERVAL = 1000; //ms;

type IntervalRef = ReturnType<typeof setInterval>;

export function useTimer(
  props: {
    onSubmit: () => void;
    remainingTime: number;
  },
  refreshInterval: number = REFRESH_INTERVAL,
): string {
  const { onSubmit, remainingTime } = props;
  const roundZero = (time: number): string => `${`00${time || '0'}`.slice(-2)}`;
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${roundZero(minutes)}:${roundZero(seconds - minutes * 60)}`;
  };

  const [duration, setDuration] = useState(remainingTime);

  const createTimer = useCallback(() => {
    const timerId: IntervalRef = setInterval(() => {
      setDuration((duration) => {
        if (duration === 0) {
          onSubmit();
          clearInterval(timerId);
          return 0;
        }
        return duration - 1;
      });
    }, refreshInterval);
    return timerId;
  }, [onSubmit, refreshInterval]);

  useEffect(() => {
    setDuration(remainingTime);
    const timerId = createTimer();
    return () => clearInterval(timerId);
  }, [createTimer, remainingTime]);

  return formatTime(duration);
}
