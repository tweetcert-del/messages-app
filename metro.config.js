const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Solo observar carpetas de código fuente, NO node_modules
// (la resolución de módulos sigue funcionando normalmente)
config.watchFolders = [
  path.resolve(__dirname, 'app'),
  path.resolve(__dirname, 'components'),
  path.resolve(__dirname, 'constants'),
];

module.exports = config;
