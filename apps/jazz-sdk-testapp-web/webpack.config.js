/* eslint-env node */

'use strict';

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('node:path');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssNormalize = require('postcss-normalize');
const postcssEnv = require('postcss-preset-env');
const postcssRem = require('postcss-rem');

const ROOT_DIR = process.cwd();

const WEBPACK_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = WEBPACK_ENV === 'production';

module.exports = {
  target: 'web',
  mode: IS_PRODUCTION ? 'production' : 'development',
  cache: true,
  devtool: !IS_PRODUCTION && 'cheap-module-source-map',

  entry: './src/index.tsx',
  output: {
    path: path.join(ROOT_DIR, 'dist'),
    pathinfo: !IS_PRODUCTION,
    filename: IS_PRODUCTION
      ? 'static/js/[name].[contenthash:8].js'
      : 'static/js/[name].js',
    chunkFilename: IS_PRODUCTION
      ? 'static/js/[name].[contenthash:8].chunk.js'
      : 'static/js/[name].chunk.js',
    publicPath: '/',
  },
  devServer: {
    open: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      module: false,
      path: false,
      dgram: false,
      dns: false,
      fs: false,
      http2: false,
      net: false,
      tls: false,
      child_process: false,
      os: false,
      crypto: false,
    },
  },
  module: {
    parser: {
      javascript: {
        exportsPresence: 'error',
      },
    },
    rules: [
      {
        oneOf: [
          {
            test: /\.(js|mjs|jsx|ts|tsx)$/,
            exclude: [/node_modules/],
            use: [
              {
                loader: 'babel-loader',
                options: {
                  babelrc: false,
                  configFile: false,
                  compact: IS_PRODUCTION,
                  presets: [
                    [
                      '@babel/preset-env',
                      {
                        // Allow importing core-js in entrypoint and use browserlist to select polyfills
                        useBuiltIns: 'entry',
                        // Set the corejs version we are using to avoid warnings in console
                        corejs: 3,
                        // Exclude transforms that make all code slower
                        exclude: ['transform-typeof-symbol'],
                      },
                    ],
                    '@babel/preset-typescript',
                    [
                      '@babel/preset-react',
                      { development: !IS_PRODUCTION, runtime: 'automatic' },
                    ],
                  ],
                  plugins: [
                    'babel-plugin-macros',
                    // Polyfills the runtime needed for async/await, generators, and friends
                    // https://babeljs.io/docs/en/babel-plugin-transform-runtime
                    [
                      '@babel/plugin-transform-runtime',
                      {
                        version: require('@babel/runtime/package.json').version,
                        absoluteRuntime: path.dirname(
                          require.resolve('@babel/runtime/package.json'),
                        ),
                      },
                    ],
                    !IS_PRODUCTION && require.resolve('react-refresh/babel'),
                  ].filter(Boolean),
                },
              },
              {
                loader: 'astroturf/loader',
                options: { enableCssProp: true },
              },
            ],
          },
          {
            test: /\.css$/,
            sideEffects: true,
            use: [
              !IS_PRODUCTION && require.resolve('style-loader'),
              IS_PRODUCTION && {
                loader: MiniCssExtractPlugin.loader,
              },
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  modules: {
                    auto: /\.module\.css$/i,
                    localIdentName: !IS_PRODUCTION
                      ? '[name]_[hash:base64:5]'
                      : '[hash:base64]',
                  },
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    to: './assets',
                    plugins: [
                      postcssImport,
                      postcssNested,
                      postcssRem,
                      postcssEnv({
                        stage: 3,
                        features: {
                          'nesting-rules': true,
                          'custom-properties': true,
                          'color-function': { unresolved: 'warn' },
                        },
                        autoprefixer: {
                          flexbox: 'no-2009',
                        },
                        preserve: true,
                      }),
                      postcssNormalize(),
                    ],
                  },
                },
              },
            ].filter(Boolean),
          },
          {
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            resourceQuery: /react/, // foo.svg?react
            use: [
              {
                loader: '@svgr/webpack',
                options: {
                  svgo: false,
                  titleProp: true,
                  ref: true,
                },
              },
            ],
          },
          {
            test: /\.(png|svg|gif|jpe?g|bmp|ico|mp3|ttf|eot|woff|woff2|avif|webm|mp4)$/,
            type: 'asset',
            generator: {
              filename: 'static/media/[name].[hash:8][ext][query]',
            },
          },
          {
            exclude: /\.(js|mjs|jsx|ts|tsx|html|json)$/,
            type: 'asset/resource',
            generator: {
              filename: 'static/resources/[name].[hash:8][ext][query]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(ROOT_DIR, 'src/index.html'),
      filename: 'index.html',
      ...(IS_PRODUCTION
        ? {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            },
          }
        : {}),
    }),

    !IS_PRODUCTION && new ReactRefreshWebpackPlugin(),
    !IS_PRODUCTION && new CaseSensitivePathsPlugin(),

    IS_PRODUCTION &&
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),
  ].filter(Boolean),
};
