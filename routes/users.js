const express = require('express');
const passport = require('passport');
const router = express.Router();
const user = require('../controller/user');
const catchAsync = require('../utils/catchAsync');

router.route('/register')
    .get(user.renderRegister)
    .post(catchAsync(user.createUser))
    
    
// strategy authenticate for google, local, twitter,...
// failureFlash: flash message automatically
// redirect to '/login' if sth go wrong
router.route('/login')
    .get(user.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), user.directLogin)


router.get('/logout', user.logout);

module.exports = router;