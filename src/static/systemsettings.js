import sendRequest from './request.js';
import {showErrorToast, showToast} from './toast.js';

let setPasswordButton;
let updateTickerUiButton;
let restartTickerUiButton;
let updateTickerButton;
let restartTickerButton;
let addWifiNetworkButton;
let restartSystemButton;
let shutdownSystemButton;

const initialize = () => {
    var elems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(elems, {});

    setPasswordButton = document.getElementById('setpassword');

    updateTickerUiButton = document.getElementById('update-ui');
    restartTickerUiButton = document.getElementById('restart-ui');
    updateTickerButton = document.getElementById('update-ticker');
    restartTickerButton = document.getElementById('restart-ticker');
    addWifiNetworkButton = document.getElementById('add-wifi-network');

    restartSystemButton = document.getElementById('restart-system');
    shutdownSystemButton = document.getElementById('shutdown-system');

    setPasswordButton.addEventListener('click', setPassword);

    updateTickerUiButton.addEventListener('click', updateTickerUi);
    restartTickerUiButton.addEventListener('click', restartTickerUi);
    updateTickerButton.addEventListener('click', updateTicker);
    restartTickerButton.addEventListener('click', restartTicker);
    addWifiNetworkButton.addEventListener('click', addWifiPassword);

    restartSystemButton.addEventListener('click', restartSystem);
    shutdownSystemButton.addEventListener('click', shutdownSystem);
};

const setPassword = async () => {
    const newPassword = document.getElementById('uipassword');
    const repeatedPassword = document.getElementById('repeatuipassword');
    const oldPassword = document.getElementById('oldpassword');
    if (newPassword.value !== repeatedPassword.value) {
        showToast('New Passwords do not match');
        return;
    }
    const body = {};
    body[newPassword.getAttribute('name')] = newPassword.value;
    body[oldPassword.getAttribute('name')] = oldPassword.value;
    await sendCommandRequest(setPasswordButton, 'setpassword', 'New Password set', body);
}

const updateTickerUi = async () => {
    await sendCommandRequest(updateTickerUiButton, 'updatetickerui', 'Ticker Ui updated successfully. Restarting now');
};

const restartTickerUi = async () => {
    await sendCommandRequest(restartTickerUiButton, 'restarttickerui', 'Ticker Ui restarted');
};

const updateTicker = async () => {
    await sendCommandRequest(updateTickerButton, 'updateticker', 'Ticker updated successfully');
};

const restartTicker = async () => {
    await sendCommandRequest(restartTickerButton, 'restartticker', 'Ticker restarted');
};

const restartSystem = async () => {
    await sendCommandRequest(restartSystemButton, 'restartsystem', 'System will be restarted');
};

const shutdownSystem = async () => {
    await sendCommandRequest(shutdownSystemButton, 'shutdownsystem', 'System will be shutdown');
};

const addWifiPassword = async () => {
    const body = {};

    const ssidField = document.getElementById('ssid');
    body[ssidField.getAttribute('name')] = ssidField.value;
    const wifiPasswordField = document.getElementById('wifipassword');
    body[wifiPasswordField.getAttribute('name')] = wifiPasswordField.value;
    const priority = document.getElementById('priority');
    body[priority.getAttribute('name')] = priority.value;

    await sendCommandRequest(addWifiNetworkButton, 'addwifipassword', 'Wifi added. A system restart is needed', body);
};

const sendCommandRequest = async (button, command, successMessage, body) => {
    button.classList.add('disabled');

    await sendRequest(`/systemsettings/${command}`, body || {})
        .then((res) => {
            if (res.status === 200) {
                showToast(successMessage);
            } else if (res.status === 204) {
                showToast('Already up to date');
            } else if (res.status === 403) {
                showToast('Please login again');
                setTimeout(() => {
                    window.location.href = '/';
                }, 4000);
            } else {
                M.toast({html: 'An error occurred. Please try again later.'});
            }
        })
        .catch(() => {
            showErrorToast();
        })
        .finally(() => {
            button.classList.remove('disabled');
        });
};

document.addEventListener('DOMContentLoaded', initialize, false);