const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const process = require('process');
const path = require('path');
const {getLogger} = require('./logger');

let passwordHash;

exports.login = (req, res) => {
    if (isPasswordValid(req)) {
        setAccessTokenCookie(res);
    } else {
        res.sendStatus(401);
    }
};

const setAccessTokenCookie = (res) => {
    const token = generateAccessToken();
    res.cookie('token', token, {expires: new Date(Date.now() + 900000), httpOnly: true, sameSite: 'strict'});
    res.sendStatus(200);
    return res;
};

exports.checkPassword = (req) => {
    return isPasswordValid(req);
};

exports.setNewPassword = (newPassword, res) => {
    const salt = bcrypt.genSaltSync(10);
    const newPasswordHash = bcrypt.hashSync(newPassword, salt);
    fs.writeFileSync(path.join(process.cwd(), '.password'), newPasswordHash, {encoding: 'utf8'});
    passwordHash = newPasswordHash;
    setAccessTokenCookie(res);
    return res;
};

const isPasswordValid = (req) => {
    const passwordParam = req.body.password;
    return bcrypt.compareSync(passwordParam, retrievePassword());
};

const retrievePassword = () => {
    if (passwordHash) {
        return passwordHash;
    }
    passwordHash = fs.readFileSync(path.join(process.cwd(), '.password'), {encoding: 'utf8'}).toString();
    return passwordHash;
};

const generateAccessToken = () => {
    return jwt.sign({}, process.env.TOKEN_SECRET + retrievePassword(), {
        expiresIn: 900
    });
};

exports.verifyToken = (req, res, next) => {
    const {token} = req.cookies;

    if (!token) {
        return handleInvalidToken(req, res);
    }

    jwt.verify(token, process.env.TOKEN_SECRET + retrievePassword(), (err, decodedToken) => {
        if (err) {
            getLogger().error('Error while decoding secret', e);
            return handleInvalidToken(req, res);
        }
        next();
    });
};

const handleInvalidToken = (req, res) => {
    res.clearCookie('token');
    if (req.method === 'GET') {
        return res.redirect('/');
    }
    return res.sendStatus(403);
};