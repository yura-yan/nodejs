const { Router } = require('express')
const orderModel = require('../models/order')
const auth = require('../middleware/auth')

const router = Router()


router.get('/', auth, async (req, res) => {
    const orders = await orderModel.find({'user.userId': req.user.id}).populate('user.userId').lean()
    
    res.render('orders', {
        title: 'Orders',
        isOrder: true,
        orders: orders.map(el => {
            return {
                ...el,
                price: el.courses.reduce((total, e) => {
                    return total += e.count * e.course.price
                }, 0)
            }
        })
    })
})

router.post('/', auth, async (req, res) => {
    try {
        const user = await req.user.populate('card.items.courseId').execPopulate()
        const courses = user.card.items.map(el => ({
            course: {...el.courseId._doc}, 
            count: el.count
        }))
        const order = new orderModel({
            courses: courses,
            user: {
                name: user.name,
                userId: user.id
            },
        })

        await order.save()
        await req.user.removeData()

        res.redirect('/orders')
    } catch (e) {
        console.log(e)
    }
})

module.exports = router