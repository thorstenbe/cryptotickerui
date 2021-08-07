const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const {getLogger} = require('./logger');

const load = () => {
    try {
        const configFile = fs.readFileSync(getConfigFilePath(), 'utf8');
        const configYaml = yaml.load(configFile);
        getLogger().debug('Loaded config %o', configYaml);
        return configYaml;
    } catch (e) {
        getLogger().error('Error while reading config file', e);
    }
};

const save = (newConfig) => {
    getLogger().debug('Merging configs before save');
    const mergedConfig = load();

    Object.keys(newConfig.display).forEach(function (key) {
        const value = newConfig.display[key];
        if (isValueSet(value)) {
            mergedConfig.display[key] = value;
        }
    });

    Object.keys(newConfig.ticker).forEach(function (key) {
        const value = newConfig.ticker[key];
        if (isValueSet(value)) {
            mergedConfig.ticker[key] = value;
        }
    });

    getLogger().debug('Writing new config %o', mergedConfig);
    try {
        fs.writeFileSync(getConfigFilePath(), yaml.dump(mergedConfig));
    } catch (e) {
        getLogger().error('Error while writing config file', e);
    }
};

const getConfigFilePath = () => {
    return path.join(process.env.BTCTICKER_PATH, 'config.yaml');
};

const isValueSet = (value) => {
    return typeof value == 'boolean' || typeof value == 'string';
};

module.exports = {
    saveConfig: save,
    loadConfig: load
};