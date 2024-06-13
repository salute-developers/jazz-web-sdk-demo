#!/usr/bin/env node

/* eslint-env node */

const chalk = require('chalk');
const net = require('net');
const { spawn } = require('child_process');

const { HTTPS, PORT = '3000' } = process.env;

const isHttps = HTTPS === 'false';
process.env.ELECTRON_START_URL =
  process.env.ELECTRON_START_URL ||
  `${isHttps ? 'https' : 'http'}://localhost:${PORT}`;

const CHECK_INTERVAL = 1000;

const WEBPACK_ENV = process.env.NODE_ENV || 'development';

let startedElectron = false;

const client = new net.Socket();

function checkConnection() {
  client.connect({ port: Number(PORT) });
}

client.setTimeout(CHECK_INTERVAL * 0.9);
client.addListener('connect', () => {
  client.end();

  if (!startedElectron) {
    console.log(chalk.cyan('Starting electron...', WEBPACK_ENV));
    startedElectron = true;

    executeCommand('electron --inspect=5858 .').then((code) => {
      process.exit(code);
    });
  }
});
const onFailedCheck = () => {
  client.end();
  setTimeout(checkConnection, CHECK_INTERVAL);
};
client.addListener('error', onFailedCheck);
client.addListener('timeout', onFailedCheck);

checkConnection();

/**
 * @param {string} command
 * @param {{cwd?: string, noExit?: boolean}} options
 * @return {Promise<number>}
 */
function executeCommand(command, options = {}) {
  const { cwd, noExit } = options;

  let result = new Promise((resolve, reject) => {
    const process = spawn(command, { shell: true, stdio: 'inherit', cwd });
    process.on('error', (error) => reject(error));
    process.on('close', (code) => resolve(code));
  });

  if (!noExit) {
    result = result.then((code) => {
      if (!Number.isNaN(code) && code !== 0) {
        process.exit(code);
      }
      return code;
    });
  }

  return result;
}
