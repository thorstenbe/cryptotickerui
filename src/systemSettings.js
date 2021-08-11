const simpleGit = require('simple-git');
const {exec} = require('child_process');
const {checkPassword, setNewPassword} = require('./security');
const {getLogger} = require('./logger');
fs = require('fs');


exports.updateTickerUi = async (req, res) => {
    getLogger().info('Updating ticker ui');
    const git = simpleGit({baseDir: process.cwd()});
    const status = await git.fetch().status();

    if (status.behind === 0) {
        getLogger().debug('Ticker ui up to date');
        return res.sendStatus(204);
    }

    try {
        const pulled = await git.pull();

        if (pulled.files.includes('package.json') || pulled.files.includes('package-lock.json')) {
            getLogger().info('Package json changed');
            fs.writeFileSync('update-npm.conf', '');
        }

        return handleTickerUiRestart(res);
    } catch (error) {
        getLogger().error(error, 'Error while updating Ticker ui');
        res.sendStatus(500);
    }
};

exports.restartTickerUi = async (req, res) => {
    return handleTickerUiRestart(res);
};

const handleTickerUiRestart = async (res) => {
    res.sendStatus(200);
    getLogger().info('Restarting Ticker ui');
    await execShell(process.env.RESTART_TICKER_UI_COMMAND);
};

exports.updateTicker = async (req, res) => {
    const git = simpleGit({baseDir: process.env.BTCTICKER_PATH});
    const status = await git.fetch().status();

    getLogger().info('Updating ticker');

    if (status.behind === 0) {
        getLogger().debug('Ticker is up to date');
        return res.sendStatus(204);
    }

    try {
        const pulled = await git.pull();

        getLogger().info('Stopping ticker');
        await execShell(process.env.STOP_TICKER_COMMAND);

        if (pulled.files.includes('requirements.txt')) {
            getLogger().info('Installing updated requirements');
            const updateTickerCommand = `cd ${process.env.BTCTICKER_PATH} && python3 -m pip install -r requirements.txt`;
            await execShell(updateTickerCommand);
        }
        return handleTickerRestart(res);
    } catch (error) {
        getLogger().error(error, 'Error while updating ticker');
        return res.sendStatus(500);
    }
};

exports.restartTicker = async (req, res) => {
    return await handleTickerRestart(res);
};

const handleTickerRestart = async (res) => {
    getLogger().info('Restarting ticker');
    await execShell(process.env.RESTART_TICKER_COMMAND);
    return res.sendStatus(200);
};

exports.setPassword = async (req, res) => {
    try {
        getLogger().info('Setting new password');
        const newPassword = req.body.newpassword;
        if (!checkPassword(req)) {
            return res.sendStatus(401);
        }
        setNewPassword(newPassword, res);
        return res;
    } catch (e) {
        getLogger().error('Error while setting new password',e);
        return res.sendStatus(500);
    }
};

exports.addWifi = async (req, res) => {
    try {
        const ssid = req.body.ssid;
        const wifiPassword = req.body.password;
        const priorityParam = req.body.priority;
        const priority = isNaN(priorityParam) || priorityParam === '' ? 0 : req.body.priority;

        if (!ssid || ssid === '' || !wifiPassword || wifiPassword === '') {
            getLogger().error('SSID or password empty. Wifi not added');
            return res.sendStatus(500);
        }

        const networkTemplate = `network={
        ssid="${ssid}"
        psk=${wifiPassword}
        priority=${priority}
}`;
        await execShell(`echo '${networkTemplate}' | ${process.env.ADD_WIFI_COMMAND}`);
        res.sendStatus(200);
    } catch (error) {
        getLogger().error('Error while adding new wifi network');
        return res.sendStatus(500);
    }
};

exports.restartSystem = async (req, res) => {
    try {
        getLogger().info('Restarting system');
        await execShell(process.env.RESTART_SYSTEM_COMMAND);
        return res.sendStatus(200);
    } catch (error) {
        getLogger().error(error, 'Error while restarting system');
        return res.sendStatus(500);
    }
};

exports.shutdownSystem = async (req, res) => {
    try {
        getLogger().info('Shutting down system');
        await execShell(process.env.SHUTDOWN_SYSTEM_COMMAND);
        return res.sendStatus(200);
    } catch (error) {
        getLogger().error(error, 'Error while shutting down system');
        return res.sendStatus(500);
    }
};

const execShell = (shellCommand) => {
    return new Promise((resolve, reject) => {
        exec(shellCommand, (error) => {
            if (error) {
                getLogger().error(error, 'Error while executing shell command');
                reject();
                return;
            }
            resolve();
        });
    });
};
