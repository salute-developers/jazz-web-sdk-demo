import { filter, Observable, UnaryFunction } from 'rxjs';

import { Action, createAction } from './action';

export type EventLike = {
  type: string;
};

export type EventBus<T extends EventLike> = Action<T>;

export function createEventBus<T extends EventLike>(): EventBus<T> {
  return createAction();
}

export function filterByType<
  Event extends EventLike,
  Type extends Event['type'],
  Result extends Event & { type: Type },
>(...types: Type[]): UnaryFunction<Observable<Event>, Observable<Result>> {
  const predicate = (event: Event): event is Result =>
    types.includes(event.type as Type);
  return (source$) => source$.pipe(filter(predicate));
}
