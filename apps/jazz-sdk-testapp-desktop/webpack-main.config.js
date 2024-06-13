/* eslint-env node */

'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = function () {
  const isEnvProduction = process.env.NODE_ENV === 'production';

  const baseConfig = {
    mode: isEnvProduction ? 'production' : 'development',
    bail: isEnvProduction,
    devtool: isEnvProduction ? false : 'cheap-module-source-map',

    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.(js|mjs|ts)$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            babelrc: false,
            configFile: false,
            presets: [
              '@babel/preset-typescript',
              ['@babel/preset-env', { targets: { node: '16.5' } }],
            ],
            compact: isEnvProduction,
          },
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.json', '...'],
    },
    optimization: {
      minimize: isEnvProduction,
    },
  };

  return [
    {
      ...baseConfig,
      target: 'electron-main',
      entry: './src-main/index.ts',
      output: {
        path: path.join(__dirname, 'build/electron'),
        filename: 'index.js',
      },
    },
    {
      ...baseConfig,
      target: 'electron-main',
      entry: './src-preload/index.ts',
      output: {
        path: path.join(__dirname, 'build/electron'),
        filename: 'preload.js',
      },
    },
  ];
};
