import { GlobalContext } from './globalContext';

export type PluginFactory = (
  controller: (context: GlobalContext) => void,
) => Plugin;

export type Plugin = (context: GlobalContext) => void;
