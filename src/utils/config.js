const fs = require('fs');

function getConfigPath() {
  let configPath = process.env.CONFIG_PATH;
  if (!configPath) {
    configPath = `${process.cwd()}/config.template.json`;
    // eslint-disable-next-line no-console
    console.log(`Environment variable CONFIG_PATH not specified - using default config from ${configPath}`);
  } else if (!configPath.startsWith('/')) {
    configPath = `${process.cwd()}/${configPath}`;
  }

  return configPath;
}

function validateConfig(config) {
  let validatedConfig = config;
  if (!validatedConfig || typeof validatedConfig !== 'object') {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    validatedConfig = require(getConfigPath());
  }

  if (!validatedConfig.port) {
    validatedConfig.port = 3000;
    console.error(`'port' not specified in config - using default ${validatedConfig.port}`);
  }

  return validatedConfig;
}

function getConfig() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    throw new Error(`config not found in ${configPath}`);
  }

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const config = validateConfig(require(configPath));
  return config;
}

module.exports = getConfig();
