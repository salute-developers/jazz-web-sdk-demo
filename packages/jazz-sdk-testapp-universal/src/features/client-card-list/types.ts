import { FC } from 'react';

import { JazzClient } from '@salutejs/jazz-sdk-web';

export type ClientCardListProps = {
  clientCardComponent: FC<{ client: JazzClient }>;
};
