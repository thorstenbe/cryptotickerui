const request = require('request');
const {loadConfig} = require('./configHandler');
const NodeCache = require('node-cache');
const {getLogger} = require('./logger');

const coingeckoCache = new NodeCache({stdTTL: 600, checkperiod: 620});
const coinListCacheKey = 'coinlist';

exports.displaySettings = async (req, res) => {
    try {
        const config = loadConfig();
        const viewModel = {};
        viewModel.csrfToken = req.csrfToken();
        viewModel.config = config;
        viewModel.coins = await getCoins();
        viewModel.selectedCoins = prepareDisplayedCoins(config);
        return res.render('tickersettings', viewModel);
    } catch (e) {
        getLogger().error('Error while rendering ticker view', e);
    }
    return res.redirect('/');
};

const prepareDisplayedCoins = (config) => {
    let template = '';
    const displayed = config.ticker.currency.split(',');
    displayed.forEach(coin => {
        if (coin !== '') {
            template += formatDisplayCoinTemplate(coin);
        }
    });
    template += getDisplayedCoinHtmTemplate();
    return template;
};

const formatDisplayCoinTemplate = (coin) => {
    return `<li class="card-panel valign-wrapper crypto--card js--currency" data-name="${coin}">
    <i class="material-icons crypto-card__drag-indicator">drag_indicator</i>
    <span class="crypto-card__title">${coin}</span>
    <i class="material-icons js--delete-crypto crypto-card__delete-button">delete</i>
</li>`;
};

const getDisplayedCoinHtmTemplate = () => {
    return `<template id="displayedCoinTemplate">${formatDisplayCoinTemplate('')}</template>`;
};

const getCoins = () => {
    return new Promise((resolve, reject) => {
        const coinList = coingeckoCache.get(coinListCacheKey);

        if (coinList === undefined) {
            request('https://api.coingecko.com/api/v3/coins/list', {json: true}, (err, res, body) => {
                if (err) {
                    getLogger().error('Could not fetch coin list from CoinGecko', e);
                    reject();
                }
                const preparedCoins = prepareCoins(body);
                coingeckoCache.set(coinListCacheKey, preparedCoins);
                resolve(preparedCoins);
            });
        } else {
            resolve(coinList);
        }
    });
};

const prepareCoins = (coins) => {
    const result = {};
    coins.filter(coin => coin.id !== '').map(coin => coin.id).forEach((coinId) => {
        result[coinId] = null;
    });
    return result;
};