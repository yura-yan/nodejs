const {Router} = require('express')
const courseModel = require('../models/courses')
const auth = require('../middleware/auth')
const { validationResult } = require('express-validator')
const { courseValidators } = require('../utils/validators')

const router = Router()

router.get('/', auth, (req, res) => {
    res.render('add', {
        title: 'Add course',
        isAdd: true
    })
})

router.post('/', auth, courseValidators, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).render('add', {
            title: 'Add course',
            isAdd: true,
            errors: errors.array()[0].msg,
            data: {
                title: req.body.title,
                price: req.body.price,
                img: req.body.img
            }
        })
    }

    try {
        const course = new courseModel({
            title: req.body.title,
            price: req.body.price,
            img: req.body.img,
            userId: req.user
        })
        
        await course.save()
        res.redirect('/courses')
    } catch (e) {
        console.log(e)
    }
})

module.exports = router