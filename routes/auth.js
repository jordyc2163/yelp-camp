const express = require('express')
const router = express.Router()
const auth = require('../controllers/auth')
const catchAsync = require('../utils/catchAsync')

const passport = require('passport')

router.route('/register')
    .get(auth.renderRegisterForm)
    .post(catchAsync(auth.registerUser))

router.route('/login')
    .get(auth.renderLoginForm)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}), auth.login)

router.post('/logout', auth.logout)

module.exports = router