import { GlobalContext } from '../types/globalContext';
import { Plugin, PluginFactory } from '../types/plugins';

export const createPlugin: PluginFactory = (controller) => {
  return (context) => {
    controller(context);
  };
};

export const pluginsInit = (
  plugins: Plugin[],
  context: GlobalContext,
): void => {
  for (let index = 0; index < plugins.length; index++) {
    const plugin = plugins[index];

    plugin(context);
  }
};
