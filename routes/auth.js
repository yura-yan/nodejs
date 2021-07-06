const { Router } = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { validationResult } = require('express-validator')
const { regValidators } = require('../utils/validators')
const { loginValidators } = require('../utils/validators')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const keys = require('../keys')
const regEmail = require('../emails/register')
const resetPass = require('../emails/password')

const transporter = nodemailer.createTransport(sendgrid({
    auth: { api_key: keys.SENDGRID_API_KEY }
}))

const router = Router()

router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        isLogin: true,
        registerError: req.flash('registerError'),
        loginError: req.flash('loginError')
    })
})

router.post('/login', loginValidators, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        req.flash('loginError', errors.array()[0].msg)
        return res.status(400).redirect('/auth/login')
    }

    try {
        const { email, password } = req.body
        const candidate = await User.findOne({ email })

        if (candidate) {
            const asSame = await bcrypt.compare(password, candidate.password)
            if (asSame) {
                req.session.user = candidate
                req.session.isAuthenicated = true
                req.session.save(err => {
                    if (err) {
                        throw err
                    } else {
                        res.redirect('/')
                    }
                })
            } else {
                req.flash('loginError', 'Password is wrong')
                res.redirect('/auth/login')
            }
        } else {
            req.flash('loginError', 'This user does not exsist')
            res.redirect('/auth/login')
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/register', regValidators, async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg)
            return res.status(400).redirect('/auth/login#register');
        }

        const { name, email, password } = req.body

        const passHash = await bcrypt.hash(password, 10)
        const user = new User({
            email,
            name,
            password: passHash,
            card: { items: [] }
        })

        await user.save()

        res.redirect('/auth/login')

        await transporter.sendMail(regEmail(email))
    } catch (e) {
        console.log(e)
    }
})

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login')
    })
})

router.get('/reset', (req, res) => {
    res.render('auth/resetpass', {
        title: 'Password reset',
        error: req.flash('error')
    })
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Something went wrong please try later')
                return res.redirect('/auth/reset')
            }
            const token = buffer.toString('hex')
            const candidate = await User.findOne({ email: req.body.email })
            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()
                await transporter.sendMail(resetPass(candidate.email, token))
                res.redirect('/auth/login')
            } else {
                req.flash('error', 'User with this email not found')
                res.redirect('/auth/reset')
            }
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login')
    }
    try {
        const candidate = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() }
        })
        if (candidate) {
            res.render('auth/newpass', {
                title: 'Set new password',
                userId: candidate._id.toString(),
                token: req.params.token,
                error: req.flash('error')
            })
        } else {
            return res.redirect('/auth/login')
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/password', async (req, res) => {
    try {
        const { userId, token, password } = req.body

        const user = await User.findOne({
            _id: userId,
            resetToken: token,
            resetTokenExp: { $gt: Date.now() }
        })

        if (user) {
            user.password = await bcrypt.hash(password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            res.redirect('/auth/login')

        } else {
            req.flash('loginError', 'Token lifecycle ended')
            res.redirect('/auth/login')
        }
    } catch (e) {
        console.log(e)
    }
})

module.exports = router