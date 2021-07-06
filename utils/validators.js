const { body } = require('express-validator')
const User = require('../models/user')

exports.regValidators = [
    body('name')
        .isLength({min: 3}).withMessage('Name field have to been min 3 length')
        .trim(),
    body('email')
        .isEmail().withMessage('Please write the correct email')
        .custom(async (value) => {
            try {
                const user = await User.findOne({email: value})
                if (user) {
                    return Promise.reject('This email already used')
                }
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail(),
    body('password', 'Min password have to been 6 symbols')
        .isLength({min: 6, max: 10})
        .isAlphanumeric()
        .trim(),
    body('confpass')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Confirm password not match to password')
            }

            return true
        })
        .trim()
    ]

exports.loginValidators = [
    body('email').isEmail().withMessage('Please write correct the email address'),
    body('password').isLength({min: 4}).withMessage('Password length have to been min 6 symbols')
]

exports.courseValidators = [
    body('title').isLength({min: 4}).withMessage('Title length have to been min 4 symbols').trim(),
    body('price').isNumeric().withMessage('Please write correct price'),
    body('img').isURL().withMessage('Please write correct image url')
]