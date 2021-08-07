const {saveConfig} = require('./configHandler');
const {exec} = require('child_process');
const {getLogger} = require('./logger');

exports.save = (req, res) => {
    getLogger().info('Saving new config');
    const newConfig = req.body;
    saveConfig(newConfig);
    restartTicker();
    res.json();
};

const restartTicker = () => {
    getLogger().info('Restarting ticker ui');
    const afterConfigCommand = process.env.RESTART_TICKER_COMMAND;
    if (afterConfigCommand) {
        exec(afterConfigCommand, (error) => {
            if (error) {
                getLogger().error('Error while restarting Ticker ui', error);
            }
        });
    }
}