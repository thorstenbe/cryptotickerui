import sendRequest from './request.js';
import {showErrorToast} from './toast.js';

let loginButton;

const attachListener = () => {
    loginButton = document.getElementById('login');
    loginButton.addEventListener('click', login);
};

const login = async () => {
    const passwordField = document.getElementById('password');
    let body = {password: passwordField.value};
    loginButton.classList.add('disabled');
    await sendRequest('/login', body)
        .then(handleResponse)
        .catch(() => {
            showErrorToast();
        });
    loginButton.classList.remove('disabled');
};

const handleResponse = (res) => {
    if (res.status === 200) {
        window.location.href = '/tickersettings';
    } else {
        M.toast({html: 'Authentication failed'});
    }
};

document.addEventListener('DOMContentLoaded', attachListener, false);