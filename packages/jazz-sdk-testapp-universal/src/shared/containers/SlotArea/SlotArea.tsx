import { useMemo } from 'react';

import { compute } from 'nrgy';
import { useAtom } from 'nrgy/react';

import { useGlobalContext } from '../../contexts/globalContext';
import { SlotName } from '../../types/slots';

// Компонент SlotArea
export type SlotAreaProps = { slotName: SlotName };

export const SlotArea: React.FC<SlotAreaProps> = ({ slotName }) => {
  const { slotsManager } = useGlobalContext();

  const slotAtom = useMemo(
    () => compute(() => slotsManager.slots().get(slotName)),
    [slotsManager, slotName],
  );

  const slot = useAtom(slotAtom);

  if (!slot) return null;

  return (
    <>
      {slot.components.map((Comp, idx) => (
        <Comp key={idx} />
      ))}
    </>
  );
};
