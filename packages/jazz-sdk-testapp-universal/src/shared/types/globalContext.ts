import { JazzRoom, JazzSdk } from '@salutejs/jazz-sdk-web';
import { Scope } from 'nrgy';
import { Observable } from 'rxjs';

import { EventBus } from '../utils/createEventBus';
import { MediaManager } from '../utils/mediaManager';
import { MenuManager } from '../utils/menuManager';
import { SlotsManager } from '../utils/slotsManager';

export type GlobalContext = {
  slotsManager: SlotsManager;
  menuManager: MenuManager;
  mediaManager: MediaManager;
  eventBus: EventBus<Events>;
  event$: Observable<Events>;
  devices: {
    getAudioInput: () => string | undefined;
    setAudioInput: (value: string | undefined) => void;
    getVideoInput: () => string | undefined;
    setVideoInput: (value: string | undefined) => void;
    getAudioOutput: () => string | undefined;
    setAudioOutput: (value: string | undefined) => void;
  };
  scope: Scope;
};

export type ErrorEvent = {
  type: 'error';
  payload: {
    title: string;
  };
};

export type Events =
  | ErrorEvent
  | {
      type: 'roomSettingsOpen';
      payload: {
        room: JazzRoom;
      };
    }
  | {
      type: 'roomDetailModalOpen';
      payload: {
        room: JazzRoom;
      };
    }
  | {
      type: 'roomInfoModalOpen';
      payload: {
        room: JazzRoom;
      };
    }
  | {
      type: 'setSdk';
      payload: {
        sdk: JazzSdk | undefined;
      };
    }
  | {
      type: 'message';
      payload: {
        type: string;
        payload?: unknown;
      };
    };
