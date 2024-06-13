const fs = require('fs');
const path = require('path');

const ROOT_DIR = fs.realpathSync(path.resolve(__dirname, '..'));
const CURRENT_DIR = fs.realpathSync(process.cwd());

/**
 * @param {string} relativePath
 * @return {string}
 */
function resolveByCurrentDir(relativePath) {
  return path.resolve(CURRENT_DIR, relativePath);
}

/**
 * @param {string} relativePath
 * @return {string}
 */
function resolveByRootDir(relativePath) {
  return path.resolve(ROOT_DIR, relativePath);
}

function getElectronVersion() {
  const rootPackage = require(resolveByRootDir('package.json'));
  return rootPackage.devDependencies.electron;
}

/**
 * @param {string} packageName
 * @param {string} relativePath
 * @return {string}
 */
function resolveByPackage(packageName, relativePath) {
  const packageDir = path.dirname(
    require.resolve(`${packageName}/package.json`, { paths: [CURRENT_DIR] }),
  );
  const filePath = relativePath
    ? path.resolve(packageDir, relativePath)
    : packageDir;
  return fs.realpathSync(filePath);
}

module.exports = {
  ROOT_DIR,
  CURRENT_DIR,
  resolveByCurrentDir,
  getElectronVersion,
  resolveByPackage,
  resolveByRootDir,
};
