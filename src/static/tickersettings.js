import sendRequest from './request.js';
import {showToast, showErrorToast} from './toast.js';

let autoComplete;
let displayedCoinTemplate;
let cryptoList;
let tapTarget;

const initialize = () => {
    const elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);

    displayedCoinTemplate = document.getElementById('displayedCoinTemplate');
    autoComplete = document.getElementById('autocomplete-input');
    const autoCompleteValues = JSON.parse(document.getElementById('autofill-coins').content);
    M.Autocomplete.init(autoComplete, {
        data: autoCompleteValues,
        limit: 40,
        onAutocomplete: onAutoComplete
    });

    const floatingActionButton = document.querySelector('.fixed-action-btn');
    M.FloatingActionButton.init();

    floatingActionButton.addEventListener('click', onSave);

    cryptoList = document.getElementById('crypto-list');
    Sortable.create(cryptoList, {
        animation: 150,
        filter: '.js--delete-crypto'
    });
    registerDeleteCryptoHandler();

    M.updateTextFields();
};

const registerDeleteCryptoHandler = () => {
    document.querySelectorAll('.js--delete-crypto').forEach(addRemoveCryptoListener);
};

const addRemoveCryptoListener = (element) => {
    element.addEventListener('click', (event) => {
        const cryptoCard = event.currentTarget.parentNode;
        cryptoCard.parentNode.removeChild(cryptoCard);
    });
};

const onSave = () => {
    const requestData = {};
    requestData.display = getDisplayOptions();
    requestData.ticker = getTickerOptions();

    sendRequest('/tickersettings/save', requestData)
        .then(handleSaveResponse)
        .catch(() => {
            showErrorToast();
        });
};

const handleSaveResponse = (res) => {
    if (res.status === 200) {
        showToast('Configuration saved successfully');
    } else if (res.status === 403) {
        showToast('Please login again');
        setTimeout(() => {
            window.location.href = '/';
        }, 4000);
    } else {
        showErrorToast();
    }
};

const getDisplayOptions = () => {
    const requestData = {};
    const checkboxes = document.querySelectorAll('.js--display-options .js--checkbox');
    checkboxes.forEach((checkbox) => {
        requestData[checkbox.name] = checkbox.checked;
    });

    const selects = document.querySelectorAll('.js--display-options .js--select');
    selects.forEach((select) => {
        const selected = select.options[select.selectedIndex].text;
        requestData[select.name] = selected.replace('°', '');
    });

    return requestData;
};

const getTickerOptions = () => {
    const requestData = {};
    requestData.currency = getCurrencies();
    return Object.assign(requestData, getTickerData());
};

const getCurrencies = () => {
    const selected = [];
    const currencies = document.querySelectorAll('.js--currency');
    currencies.forEach((currency) => {
        selected.push(currency.getAttribute('data-name'));
    });

    return selected.join(',');
};

const getTickerData = () => {
    const requestData = {};
    const textFields = document.querySelectorAll('.js--ticker-options .js--text');
    textFields.forEach((textfield) => {
        requestData[textfield.name] = textfield.value;
    });
    return requestData;
};

const onAutoComplete = () => {
    const selectedValue = autoComplete.value;
    const coinTemplate = document.importNode(displayedCoinTemplate.content, true);
    coinTemplate.querySelector('li').setAttribute('data-name', selectedValue);
    coinTemplate.querySelector('span').textContent = selectedValue;
    addRemoveCryptoListener(coinTemplate.querySelector('.js--delete-crypto'));

    cryptoList.appendChild(coinTemplate);
};

document.addEventListener('DOMContentLoaded', initialize, false);