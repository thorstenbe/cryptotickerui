const express = require('express');
const app = express();
const router = express.Router();
const env = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const security = require('./security');
const tickerSettings = require('./tickersettings');
const saveTickerSettingsHandler = require('./saveTickerSettings');
const systemSettingsHandler = require('./systemSettings');
const path = require('path');
const csurf = require('csurf');
const {getLogger} = require('./logger');

const csrfProtection = csurf({cookie: true});

env.config();

router.use(bodyParser.json());
router.use(express.static(__dirname + '/static'));
router.use(cookieParser());

router.get('/', csrfProtection, (req, res) => {
    return res.render('index', {csrfToken: req.csrfToken()});
});

router.post('/login', csrfProtection,  security.login);

router.use('/tickersettings', csrfProtection, security.verifyToken);
router.get('/tickersettings', tickerSettings.displaySettings);

router.use('/tickersettings/save', csrfProtection, security.verifyToken);
router.post('/tickersettings/save', saveTickerSettingsHandler.save);

router.use('/systemsettings', csrfProtection, security.verifyToken);
router.get('/systemsettings', (req, res) => {
    return res.render('systemsettings', {csrfToken: req.csrfToken()});
});

router.use('/systemsettings/updatetickerui', csrfProtection, security.verifyToken);
router.post('/systemsettings/updatetickerui', systemSettingsHandler.updateTickerUi);

router.use('/systemsettings/restarttickerui', csrfProtection, security.verifyToken);
router.post('/systemsettings/restarttickerui', systemSettingsHandler.restartTickerUi);

router.use('/systemsettings/updateticker', csrfProtection, security.verifyToken);
router.post('/systemsettings/updateticker', systemSettingsHandler.updateTicker);

router.use('/systemsettings/restartticker', csrfProtection, security.verifyToken);
router.post('/systemsettings/restartticker', systemSettingsHandler.restartTicker);

router.use('/systemsettings/addwifipassword', csrfProtection, security.verifyToken);
router.post('/systemsettings/addwifipassword', systemSettingsHandler.addWifi);

router.use('/systemsettings/restartsystem', csrfProtection, security.verifyToken);
router.post('/systemsettings/restartsystem', systemSettingsHandler.restartSystem);

router.use('/systemsettings/shutdownsystem', csrfProtection, security.verifyToken);
router.post('/systemsettings/shutdownsystem', systemSettingsHandler.shutdownSystem);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/', router);

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || '0.0.0.0';

app.listen(port, hostname, () => {
    getLogger().info(`Server running on ${hostname}:${port}`);
});