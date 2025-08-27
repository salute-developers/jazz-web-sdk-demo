import { FC, memo } from 'react';

import { ClientCardList } from '../features/client-card-list';

import { ClientCardWidget } from './ClientCardWidget';

export const ClientCardListWidget: FC = memo(() => {
  return <ClientCardList clientCardComponent={ClientCardWidget} />;
});
