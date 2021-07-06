const {Router} = require('express')
const cardModel = require('../models/card')
const courseModel = require('../models/courses')
const auth = require('../middleware/auth')

const router = Router()

function mapCard(card) {
    return card.items.map(e => ({
        ...e.courseId._doc,
        id: e.courseId.id, 
        count: e.count
    }))
}

function countPrice(courses) {
    return courses.reduce((price, course) => {
        return price += course.price * course.count
    }, 0)
}

router.get('/', auth, async(req, res) => {
    const user = await req.user
                        .populate('card.items.courseId')
                        .execPopulate()

    const courses = mapCard(user.card)
    res.render('card', {
        title: 'Card',
        isCard: true,
        course: courses,
        price: countPrice(courses)
    })
})

router.post('/add', auth, async(req, res) => {
    const course = await courseModel.findById(req.body.id)
    await req.user.addToCard(course)
    res.redirect('/card')
})

router.delete('/remove/:id', auth, async(req, res) => {
    await req.user.removeCard(req.params.id)
    const user = await req.user.populate('card.items.courseId').execPopulate()
    const courses = mapCard(user.card)
    const card = {
        courses, price: countPrice(courses)
    }
    res.json(card)
})

module.exports = router