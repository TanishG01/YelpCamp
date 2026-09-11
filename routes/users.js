const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');
const {storeReturnTo} = require('../middleware');
const { UserExistsError } = require('passport-local-mongoose/dist/lib/errors');
const users = require('../controllers/users');


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failWithError: true }), (err, req, res, next) => {
        return res.status(401).json({ error: 'Authentication failed' });
    }, users.login);

router.get('/logout', users.logout); 

router.get('/me', (req, res) => {
    res.json({ user: req.user || null });
});

module.exports = router;